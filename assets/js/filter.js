document.addEventListener('DOMContentLoaded', () => {
    const typeCategoryCheckboxes = document.querySelectorAll('.hip-filters .filter:not(.check-all)');
    const checkAllCheckbox = document.querySelector('.hip-filters .check-all');
    const statusSelect = $('#status-filter');

    $('#status-filter').select2({
        placeholder: "Select statuses",
        allowClear: true
    }).on('change', filterRows);

    function filterRows() {
        const selectedTypesCategories = Array.from(typeCategoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value.toLowerCase());

        const selectedStatuses = statusSelect.val() || [];

        document.querySelectorAll('.hipstable tbody tr').forEach(row => {
            const rowType = row.getAttribute('data-type');
            const rowCategory = row.getAttribute('data-category');
            const rowStatus = row.getAttribute('data-status');

            // Special handling for 'informational' and 'process' types
            let typeCategoryMatch = selectedTypesCategories.includes(rowType);
            if (rowType !== 'informational' && rowType !== 'process') {
                typeCategoryMatch = typeCategoryMatch || selectedTypesCategories.includes(rowCategory);
            }

            const statusMatch = selectedStatuses.includes('all') || selectedStatuses.includes(rowStatus);

            const displayRow = typeCategoryMatch && statusMatch;

            console.log(`Row Type: ${rowType}, Category: ${rowCategory}, Status: ${rowStatus}, Display: ${displayRow}`);
            
            row.style.display = displayRow ? '' : 'none';
        });

        document.querySelectorAll('.hipstable').forEach(table => {
            const status = table.previousElementSibling;
            let hasVisibleRows = false;
    
            table.querySelectorAll('tbody tr').forEach(row => {
                if (row.style.display !== 'none') {
                    hasVisibleRows = true;
                }
            });
    
            // If no visible rows, hide the status header and table
            if (!hasVisibleRows) {
                status.style.display = 'none';
                table.style.display = 'none';
            } else {
                status.style.display = 'block'; // or whatever display style it should have
                table.style.display = 'table'; // or whatever display style it should have
            }
        });
    }

    // Bind event listeners to checkboxes and initialize filters
    bindEventListeners();
    filterRows();

    function bindEventListeners() {
        typeCategoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', filterRows);
        });

        checkAllCheckbox.addEventListener('change', function(event) {
            typeCategoryCheckboxes.forEach(checkbox => checkbox.checked = event.target.checked);
            filterRows();
        });
    }
});
