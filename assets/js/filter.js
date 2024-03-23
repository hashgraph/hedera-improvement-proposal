document.addEventListener('DOMContentLoaded', () => {
    const typeCategoryCheckboxes = document.querySelectorAll('.hip-filters .filter:not(.check-all)');
    const checkAllCheckbox = document.querySelector('.hip-filters .check-all');
    const statusSelect = document.getElementById('status-filter');
    $('#status-filter').select2({
        placeholder: "Select statuses",
        allowClear: true
    });

    function filterRows() {
        const selectedTypesCategories = Array.from(typeCategoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const selectedStatuses = Array.from(statusSelect.options)
            .filter(option => option.selected)
            .map(option => option.value.toLowerCase());

        // Keep track of which statuses have visible rows
        let visibleStatuses = {};

        // Filter rows
        document.querySelectorAll('.hipstable tbody').forEach(tbody => {
            let hasVisibleRow = false;
            const tableStatus = tbody.closest('table').previousElementSibling.id.toLowerCase();

            tbody.querySelectorAll('tr').forEach(row => {
                const rowType = row.getAttribute('data-type');
                const rowCategory = row.getAttribute('data-category');

                const typeMatch = selectedTypesCategories.includes(rowType);
                const categoryMatch = selectedTypesCategories.includes(rowCategory);
                const statusMatch = selectedStatuses.includes('all') || selectedStatuses.includes(tableStatus);

                // Show or hide the row based on type, category, and status match
                if ((typeMatch || categoryMatch) && statusMatch) {
                    row.style.display = '';
                    hasVisibleRow = true;
                } else {
                    row.style.display = 'none';
                }
            });

            // Record the status based on the visibility of the rows
            visibleStatuses[tableStatus] = hasVisibleRow;
        });

        // Show or hide the status headers and tables
        document.querySelectorAll('.hipstable').forEach(table => {
            const statusHeaderId = table.previousElementSibling.id.toLowerCase();
            if (visibleStatuses[statusHeaderId]) {
                table.style.display = '';
                table.previousElementSibling.style.display = '';
            } else {
                table.style.display = 'none';
                table.previousElementSibling.style.display = 'none';
            }
        });
    }

    // Toggle all checkboxes based on the "Check all" checkbox
    function toggleCheckAll(isChecked) {
        typeCategoryCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        filterRows();
    }

    // Event listener for the "Check all" checkbox
    checkAllCheckbox.addEventListener('change', (event) => {
        toggleCheckAll(event.target.checked);
    });

    // Event listeners for all other checkboxes
    typeCategoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            // Uncheck "Check all" if any checkbox is unchecked
            if (!event.target.checked) {
                checkAllCheckbox.checked = false;
            }
            // If all individual checkboxes are checked, also check "Check all"
            const allChecked = Array.from(typeCategoryCheckboxes).every(chk => chk.checked);
            checkAllCheckbox.checked = allChecked;

            filterRows();
        });
    });

    // Event listener for the status select dropdown
    statusSelect.addEventListener('change', filterRows);

    // Initially call filterRows to apply filters with default selection
    filterRows();
});
