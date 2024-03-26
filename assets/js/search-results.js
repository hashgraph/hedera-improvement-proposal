document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById('search-input');
    var resultsContainer = document.getElementById('results-container');

    searchInput.addEventListener('input', function () {
        if (searchInput.value.trim() !== '') {
            resultsContainer.classList.add('results-visible');
        } else {
            resultsContainer.classList.remove('results-visible');
        }
    });
});