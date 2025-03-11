document.addEventListener('DOMContentLoaded', () => {
    const statusSelect = $('#status-filter');
    const councilApprovalFilters = document.querySelectorAll('input[name="council-approval-filter"]');
    const hieroApprovalFilters = document.querySelectorAll('input[name="hiero-approval-filter"]');
    const noHipsMessage = document.querySelector('.no-hips-message');
    const councilApprovalRadios = document.querySelectorAll('input[name="council-approval-filter"]');
    const hieroApprovalRadios = document.querySelectorAll('input[name="hiero-approval-filter"]');

    councilApprovalRadios.forEach(radio => {
        radio.addEventListener('click', (e) => {
            if (e.currentTarget.checked && e.currentTarget.getAttribute('data-checked') === 'true') {
                e.currentTarget.checked = false;
                e.currentTarget.setAttribute('data-checked', 'false');
                filterRows();
            } else {
                councilApprovalRadios.forEach(r => r.setAttribute('data-checked', 'false'));
                e.currentTarget.setAttribute('data-checked', 'true');
            }
        });
    });

    hieroApprovalRadios.forEach(radio => {
        radio.addEventListener('click', (e) => {
            if (e.currentTarget.checked && e.currentTarget.getAttribute('data-checked') === 'true') {
                e.currentTarget.checked = false;
                e.currentTarget.setAttribute('data-checked', 'false');
                filterRows();
            } else {
                hieroApprovalRadios.forEach(r => r.setAttribute('data-checked', 'false'));
                e.currentTarget.setAttribute('data-checked', 'true');
            }
        });
    });

    $('#status-filter').select2({
        placeholder: "Select statuses",
        allowClear: true,
        width: 'style'
    }).on('change', () => {
        filterRows();
    });

    $('#type-filter').select2({
        placeholder: "Select types",
        allowClear: true,
        width: 'style'
    }).on('change', () => {
        filterRows();
    });

    function filterRows() {
        let selectedTypes = $('#type-filter').val();
        if (!selectedTypes || selectedTypes.length === 0) {
            selectedTypes = $('#type-filter option').map(function() { return this.value }).get();
        }

        const selectedStatuses = statusSelect.val().length > 0 ? statusSelect.val() : ['all'];
        const selectedCouncilApproval = document.querySelector('input[name="council-approval-filter"]:checked')?.value || 'all';
        const selectedHieroApproval = document.querySelector('input[name="hiero-approval-filter"]:checked')?.value || 'all';
        let anyRowVisible = false;
        document.querySelectorAll('.hipstable tbody tr').forEach(row => {
            const rowTypes = [row.getAttribute('data-type').trim().toLowerCase(), row.getAttribute('data-category').trim().toLowerCase()];
            const rowStatus = row.getAttribute('data-status').trim().toLowerCase();
            const rowCouncilApproval = row.getAttribute('data-council-approval');
            const rowHieroApproval = row.getAttribute('data-hiero-approval');

            const typeCategoryMatch = selectedTypes.some(type => rowTypes.includes(type));
            const statusMatch = selectedStatuses.includes('all') || selectedStatuses.includes(rowStatus);
            const councilApprovalMatch = selectedCouncilApproval === 'all' || selectedCouncilApproval === rowCouncilApproval;
            const hieroApprovalMatch = selectedHieroApproval === 'all' || selectedHieroApproval === rowHieroApproval;

            if (typeCategoryMatch && statusMatch && councilApprovalMatch && hieroApprovalMatch) {
                row.style.display = '';
                anyRowVisible = true;
            } else {
                row.style.display = 'none';
            }
        });

        noHipsMessage.style.display = anyRowVisible ? 'none' : 'block';
        updateTableVisibility();
    }

    function updateTableVisibility() {
        let anyTableVisible = false;
        document.querySelectorAll('.hipstable').forEach(table => {
            const isVisible = Array.from(table.querySelectorAll('tbody tr')).some(row => row.style.display !== 'none');
            anyTableVisible = anyTableVisible || isVisible;
            table.style.display = isVisible ? '' : 'none';
            const heading = table.previousElementSibling;
            heading.style.display = isVisible ? '' : 'none';
        });
        noHipsMessage.textContent = anyTableVisible ? '' : 'No HIPs match this filter.';
    }

    function bindEventListeners() {
        if (councilApprovalFilters.length > 0) {
            councilApprovalFilters.forEach(filter => filter.addEventListener('change', filterRows));
        }
        if (hieroApprovalFilters.length > 0) {
            hieroApprovalFilters.forEach(filter => filter.addEventListener('change', filterRows));
        }
    }
    
    bindEventListeners();
    filterRows();
});