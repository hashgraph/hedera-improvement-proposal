class HIPPRIntegration {
    constructor() {
        console.log('HIPPRIntegration initialized');
        this.initialize();
        this.setupStyles();
    }

    setupStyles() {
        const styles = `
            .hip-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .hip-modal-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 80%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            }
            .hip-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            .hip-modal-body {
                line-height: 1.6;
            }
            .hip-modal-body img {
                max-width: 100%;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    async initialize() {
        try {
            const prData = await this.fetchPRData();
            if (prData) {
                const validHips = await this.filterHIPPRs(prData);
                if (validHips.length > 0) {
                    this.addHIPsToTable(validHips);
                }
            }
        } catch (error) {
            console.error('Failed to initialize PR integration:', error);
        }
    }

    async fetchPRData() {
        const token = document.querySelector('meta[name="github-token"]').content;
        const query = {
            query: `query { 
                repository(name: "hedera-improvement-proposal", owner: "hashgraph") {
                    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, states: [OPEN]) {
                        nodes {
                            title
                            number
                            url
                            headRefOid
                            files(last: 100) {
                                edges {
                                    node {
                                        path
                                        additions
                                        deletions
                                    }
                                }
                            }
                            author {
                                login
                            }
                        }
                    }
                }
            }`
        };

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.errors) {
            console.error('GraphQL returned errors:', data.errors);
            return null;
        }
        return data.data.repository.pullRequests.nodes;
    }

    async filterHIPPRs(prs) {
        const validHips = [];
        const seenPRs = new Set();

        for (const pr of prs) {
            if (seenPRs.has(pr.number)) continue;

            const mdFiles = pr.files.edges.filter(file => file.node.path.endsWith('.md'));

            for (const file of mdFiles) {
                try {
                    const contentUrl = `https://raw.githubusercontent.com/hashgraph/hedera-improvement-proposal/${pr.headRefOid}/${file.node.path}`;
                    const response = await fetch(contentUrl);
                    const content = await response.text();

                    const metadata = this.parseHIPMetadata(content);

                    // Skip if title is missing, empty, a template placeholder, or exactly "No"
                    if (!metadata.title ||
                        metadata.title.trim() === '' ||
                        metadata.title === 'No' ||
                        metadata.title.includes('<') ||
                        metadata.title.includes('>') ||
                        metadata.title === '<HIP title>') {
                        continue;
                    }

                    const isNewHip = this.checkForNewHipFormat(content);

                    if (isNewHip && this.isValidHIPContent(metadata)) {
                        validHips.push({
                            pr,
                            metadata,
                            filePath: file.node.path
                        });
                        seenPRs.add(pr.number);
                        break;
                    }
                } catch (error) {
                    console.error(`Error checking file ${file.node.path}:`, error);
                }
            }
        }

        return validHips;
    }

    checkForNewHipFormat(content) {
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return false;

        const frontmatter = frontmatterMatch[1].toLowerCase();
        const requiredPatterns = [
            /\btitle\s*:/,
            /\bauthor\s*:/,
            /\bcategory\s*:/,
            /\bcreated\s*:/
        ];

        return requiredPatterns.every(pattern => pattern.test(frontmatter));
    }

    isValidHIPContent(metadata) {
        const essentialFields = ['title', 'type'];
        const hasEssentialFields = essentialFields.every(field => metadata[field]);
        const desiredFields = ['hip', 'author', 'status', 'created'];
        const desiredFieldCount = desiredFields.filter(field => metadata[field]).length;
        return hasEssentialFields && desiredFieldCount >= 2;
    }

    parseHIPMetadata(content) {
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return {};

        const metadata = {};
        const lines = frontmatterMatch[1].split('\n');

        for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                const value = valueParts.join(':').trim();
                metadata[key.trim().toLowerCase()] = value;
            }
        }

        return metadata;
    }

    addHIPsToTable(hips) {
        const wrapper = document.querySelector('main .wrapper');
        if (!wrapper) return;

        const lastStatusSection = wrapper.lastElementChild;
        const draftContainer = document.createElement('div');
        draftContainer.innerHTML = `
            <h2 id="draft">Draft <span class="status-tooltip" data-tooltip="Draft">ⓘ</span></h2>
            <table class="hipstable">
                <thead>
                    <tr>
                        <th class="numeric">Number</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Needs Council Approval</th>
                        <th class="numeric version">Release</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        wrapper.insertBefore(draftContainer, lastStatusSection.nextSibling);
        const tbody = draftContainer.querySelector('tbody');

        hips.forEach(({ pr, metadata }) => {
            // Additional title validation before creating row
            if (!metadata.title ||
                metadata.title.trim() === '' ||
                metadata.title === 'No' ||
                !pr.title) {
                return;
            }

            const row = document.createElement('tr');
            row.dataset.type = (metadata.type || 'core').toLowerCase();
            row.dataset.status = 'draft';
            row.dataset.councilApproval = 'false';
            row.dataset.category = metadata.category || '';

            row.innerHTML = `
                <td class="hip-number"><a href="${pr.url}" target="_blank">PR-${pr.number}</a></td>
                <td class="title"><a href="${pr.url}" target="_blank">${metadata.title}</a></td>
                <td class="author">${metadata.author || pr.author.login}</td>
                <td class="council-approval">No</td>
                <td class="release">Draft</td>
            `;

            tbody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HIPPRIntegration();
});