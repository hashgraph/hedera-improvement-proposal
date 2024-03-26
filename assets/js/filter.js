document.addEventListener('DOMContentLoaded', () => {
    const typeCategoryCheckboxes = document.querySelectorAll('.hip-filters .filter:not(.check-all)');
    const checkAllCheckbox = document.querySelector('.hip-filters .check-all');
    const statusSelect = $('#status-filter');
    const councilApprovalFilters = document.querySelectorAll('input[name="council-approval-filter"]');

    $('#status-filter').select2({
        placeholder: "Select statuses",
        allowClear: true
    }).on('change', filterRows);

    function filterRows() {
        const selectedTypesCategories = Array.from(typeCategoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value.toLowerCase());

        const selectedStatuses = statusSelect.val() || [];
        const selectedCouncilApproval = document.querySelector('input[name="council-approval-filter"]:checked')?.value;

        const filtersApplied = selectedTypesCategories.length > 0 || selectedStatuses.length > 0 || selectedCouncilApproval !== 'all';

        document.querySelectorAll('.hipstable tbody tr').forEach(row => {
            const rowType = row.getAttribute('data-type');
            const rowCategory = row.getAttribute('data-category');
            const rowStatus = row.getAttribute('data-status');
            const rowCouncilApproval = row.getAttribute('data-council-approval');

            const typeCategoryMatch = !filtersApplied || selectedTypesCategories.includes(rowType) || selectedTypesCategories.includes(rowCategory) || selectedTypesCategories.includes('all');
            const statusMatch = !filtersApplied || selectedStatuses.includes(rowStatus) || selectedStatuses.includes('all');
            const councilApprovalMatch = !filtersApplied || selectedCouncilApproval === rowCouncilApproval || selectedCouncilApproval === 'all';

            row.style.display = typeCategoryMatch && statusMatch && councilApprovalMatch ? '' : 'none';
        });

        updateTableVisibility();
    }

    function updateTableVisibility() {
        let anyTableVisible = false;

        document.querySelectorAll('.hipstable').forEach(table => {
            const isVisible = Array.from(table.querySelectorAll('tbody tr')).some(row => row.style.display !== 'none');
            anyTableVisible = anyTableVisible || isVisible;

            table.style.display = isVisible ? 'table' : 'none';
            table.previousElementSibling.style.display = isVisible ? 'block' : 'none';
        });

        const noHipsMessage = document.querySelector('.no-hips-message');
        if (!anyTableVisible) {
            noHipsMessage.style.display = 'block';
        } else {
            noHipsMessage.style.display = 'none';
        }
    }

    function bindEventListeners() {
        typeCategoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allSelected = areAllSelected(typeCategoryCheckboxes);
                checkAllCheckbox.checked = allSelected;
                filterRows();
            });
        });

        checkAllCheckbox.addEventListener('change', () => {
            const isChecked = checkAllCheckbox.checked;
            typeCategoryCheckboxes.forEach(checkbox => checkbox.checked = isChecked);
            filterRows();
        });

        councilApprovalFilters.forEach(filter => {
            filter.addEventListener('change', filterRows);
        });
    }

    function areAllSelected(checkboxes) {
        return Array.from(checkboxes).every(checkbox => checkbox.checked);
    }

    bindEventListeners();
    filterRows();
});
