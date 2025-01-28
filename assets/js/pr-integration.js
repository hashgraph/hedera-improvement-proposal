class HIPPRIntegration {
    constructor() {
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
        try {
            // Try with site.baseurl if it's set in _config.yml
            const baseUrl = document.querySelector('meta[name="site-baseurl"]')?.content || '';
            const response = await fetch(`${baseUrl}/_data/draft_hips.json`);

            if (!response.ok) {
                throw new Error('Failed to fetch draft HIPs data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in fetchPRData:', error);
            throw error;
        }
    }

    async filterHIPPRs(prs) {
        const validHips = [];
        const seenPRs = new Set();

        for (const pr of prs) {
            if (seenPRs.has(pr.number)) continue;

            const mdFiles = pr.files.edges.filter(file => file.node.path.endsWith('.md'));
            let bestMetadata = null;
            let bestFile = null;

            // Try all MD files and pick the one with the most complete metadata
            for (const file of mdFiles) {
                try {
                    const contentUrl = `https://raw.githubusercontent.com/hashgraph/hedera-improvement-proposal/${pr.headRefOid}/${file.node.path}`;
                    const response = await fetch(contentUrl);
                    const content = await response.text();
                    const metadata = this.parseHIPMetadata(content);

                    // Skip template files and empty metadata
                    if (file.node.path.includes('template') || !metadata.title) {
                        continue;
                    }

                    // If we don't have metadata yet, or this file has a better title
                    if (!bestMetadata ||
                        (metadata.title && metadata.title.length > 3 &&
                            (!bestMetadata.title || metadata.title.length > bestMetadata.title.length))) {
                        bestMetadata = metadata;
                        bestFile = file;
                    }
                } catch (error) {
                    console.error(`Error checking file ${file.node.path}:`, error);
                }
            }

            // If we found valid metadata, add it to the results
            if (bestMetadata && bestFile) {
                validHips.push({
                    pr,
                    metadata: bestMetadata,
                    filePath: bestFile.node.path
                });
                seenPRs.add(pr.number);
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
            <table class="hipstable draft-table">
                <thead>
                    <tr>
                        <th class="numeric">Number</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Needs TSC Review</th>
                        <th>Needs Hedera Review</th>
                    </tr>
                </thead>
                <tbody class="draft-tbody"></tbody>
            </table>
        `;

        wrapper.insertBefore(draftContainer, lastStatusSection.nextSibling);
        const tbody = draftContainer.querySelector('tbody');
        const table = draftContainer.querySelector('.hipstable');

        hips.forEach(({ pr, metadata }) => {
            if (!metadata.title || metadata.title.trim() === '') return;

            // TSC Review is independent
            const needsTSCReview = String(metadata['needs-tsc-review']).toLowerCase() === 'true';
            
            // Hedera Review should be Yes for either new hedera review flag OR old council approval
            const needsHederaReview = String(metadata['needs-council-approval']).toLowerCase() === 'true' || 
                                    String(metadata['needs-council-approval']).toLowerCase() === 'yes' ||
                                    String(metadata['needs-hedera-review']).toLowerCase() === 'true' ||
                                    metadata.status?.toLowerCase() === 'needs council review';

            console.log('Review Status:', {
                title: metadata.title,
                needsTSCReview,
                needsHederaReview
            });

            const row = document.createElement('tr');
            row.dataset.type = (metadata.type || 'core').toLowerCase();
            row.dataset.status = 'draft';
            row.dataset.councilApproval = String(metadata['needs-council-approval']).toLowerCase() === 'true' || 
                                        String(metadata['needs-council-approval']).toLowerCase() === 'yes';
            row.dataset.tscReview = needsTSCReview;
            row.dataset.hederaReview = needsHederaReview;
            row.dataset.category = metadata.category || '';

            const authors = metadata.author.split(',').map(author => {
                const match = author.trim().match(/([^<(]+)(?:[<(]([^>)]+)[>)])?/);
                if (!match) return author.trim();

                const name = match[1].trim();
                const linkInfo = match[2]?.trim();

                if (linkInfo) {
                    if (linkInfo.startsWith('@')) {
                        const username = linkInfo.substring(1);
                        return `<a href="https://github.com/${username}">${name}</a>`;
                    } else if (linkInfo.includes('@')) {
                        return `<a href="mailto:${linkInfo}">${name}</a>`;
                    }
                }
                return name;
            });

            row.innerHTML = `
                <td class="hip-number"><a href="${pr.url}" target="_blank">PR-${pr.number}</a></td>
                <td class="title"><a href="${pr.url}" target="_blank">${metadata.title}</a></td>
                <td class="author">${authors.join(', ')}</td>
                <td class="tsc-review">${needsTSCReview ? 'Yes' : 'No'}</td>
                <td class="hedera-review">${needsHederaReview ? 'Yes' : 'No'}</td>
            `;

            tbody.appendChild(row);
        });

        table.querySelectorAll('th').forEach(header => {
            header.addEventListener('click', function () {
                const tbody = table.querySelector('tbody');
                const index = Array.from(header.parentNode.children).indexOf(header);
                const isAscending = header.classList.contains('asc');
                const isNumeric = header.classList.contains('numeric');
                const isVersion = header.classList.contains('version');

                Array.from(tbody.querySelectorAll('tr'))
                    .sort((rowA, rowB) => {
                        let cellA = rowA.querySelectorAll('td')[index].textContent;
                        let cellB = rowB.querySelectorAll('td')[index].textContent;

                        if (isNumeric && cellA.startsWith('PR-') && cellB.startsWith('PR-')) {
                            // Extract numbers from PR-XXX format
                            const numA = parseInt(cellA.replace('PR-', ''));
                            const numB = parseInt(cellB.replace('PR-', ''));
                            return (numA - numB) * (isAscending ? 1 : -1);
                        }

                        // Version sorting logic
                        if (isVersion) {
                            cellA = cellA.replace('v', '').split('.').map(Number);
                            cellB = cellB.replace('v', '').split('.').map(Number);
                            return cellA > cellB ? (isAscending ? 1 : -1) : cellA < cellB ? (isAscending ? -1 : 1) : 0;
                        }

                        // Default sorting logic
                        return isNumeric ? (parseFloat(cellA) - parseFloat(cellB)) * (isAscending ? 1 : -1) : cellA.localeCompare(cellB) * (isAscending ? 1 : -1);
                    })
                    .forEach(tr => tbody.appendChild(tr));

                header.classList.toggle('asc', !isAscending);
                header.classList.toggle('desc', isAscending);

                Array.from(header.parentNode.children)
                    .filter(th => th !== header)
                    .forEach(th => th.classList.remove('asc', 'desc'));
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HIPPRIntegration();
});