document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.hipstable th').forEach(header => {
        header.addEventListener('click', function () {
            const table = header.closest('.hipstable');
            const tbody = table.querySelector('tbody');
            const index = Array.from(header.parentNode.children).indexOf(header);
            const isAscending = header.classList.contains('asc');
            const isNumeric = header.classList.contains('numeric');
            const isVersion = header.classList.contains('version');

            Array.from(tbody.querySelectorAll('tr'))
                .sort((rowA, rowB) => {
                    let cellA = rowA.querySelectorAll('td')[index].textContent;
                    let cellB = rowB.querySelectorAll('td')[index].textContent;

                    // Version sorting logic
                    if (isVersion) {
                        cellA = cellA.replace('v', '').split('.').map(Number);
                        cellB = cellB.replace('v', '').split('.').map(Number);
                        // Compare version numbers
                        return cellA > cellB ? (isAscending ? 1 : -1) : cellA < cellB ? (isAscending ? -1 : 1) : 0;
                    }

                    // Numeric and default sorting logic
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
});
