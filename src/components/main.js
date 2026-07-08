/* ==========================================================================
   Up News – Shared site scripts
   Handles: dark mode toggle (persisted) + on-page article search
   Include this file on every page with:
     <script src="path/to/components/main.js"></script>
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initSearch();
});

/* ---------------------------- Dark Mode --------------------------------- */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    const sunIcon = document.getElementById('theme-toggle-sun-icon');
    const moonIcon = document.getElementById('theme-toggle-moon-icon');

    function applyTheme(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        if (sunIcon) sunIcon.classList.toggle('hidden', !isDark);
        if (moonIcon) moonIcon.classList.toggle('hidden', isDark);
    }

    // Determine initial theme: saved preference wins, otherwise OS preference.
    const saved = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved === 'dark' : prefersDark);

    if (!btn) return;

    btn.addEventListener('click', function () {
        const isDark = !document.documentElement.classList.contains('dark');
        applyTheme(isDark);
        localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    });
}

/* ------------------------------ Search ----------------------------------- */
function initSearch() {
    const toggleBtn = document.getElementById('search-toggle-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const closeBtn = document.getElementById('search-close-btn');
    const noResultsMsg = document.getElementById('search-no-results');

    if (!toggleBtn || !searchBar || !searchInput) return;

    // Every article card on the page is treated as one searchable "item".
    const articles = Array.from(document.querySelectorAll('main article'));
    const sections = Array.from(document.querySelectorAll('main section'));

    toggleBtn.addEventListener('click', function () {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus();
        } else {
            clearSearch();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            searchBar.classList.add('hidden');
            clearSearch();
        });
    }

    searchInput.addEventListener('input', function () {
        performSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchBar.classList.add('hidden');
            clearSearch();
        }
    });

    function performSearch(query) {
        if (!query) {
            clearSearch();
            return;
        }

        const q = query.toLowerCase();
        let matchCount = 0;

        articles.forEach(function (article) {
            const isMatch = article.textContent.toLowerCase().includes(q);
            article.style.display = isMatch ? '' : 'none';
            highlightHeading(article, query, isMatch);
            if (isMatch) matchCount++;
        });

        // Hide a whole section only if it contains articles and none matched.
        sections.forEach(function (section) {
            const sectionArticles = section.querySelectorAll('article');
            if (sectionArticles.length === 0) return;
            const anyVisible = Array.from(sectionArticles).some(function (a) {
                return a.style.display !== 'none';
            });
            section.style.display = anyVisible ? '' : 'none';
        });

        if (noResultsMsg) {
            noResultsMsg.classList.toggle('hidden', matchCount !== 0 || articles.length === 0);
        }
    }

    function clearSearch() {
        searchInput.value = '';
        articles.forEach(function (article) {
            article.style.display = '';
            highlightHeading(article, '', false);
        });
        sections.forEach(function (section) {
            section.style.display = '';
        });
        if (noResultsMsg) noResultsMsg.classList.add('hidden');
    }

    function highlightHeading(article, query, isMatch) {
        const heading = article.querySelector('h1, h2, h3');
        if (!heading) return;

        if (!heading.dataset.original) {
            heading.dataset.original = heading.innerHTML;
        }

        if (!isMatch || !query) {
            heading.innerHTML = heading.dataset.original;
            return;
        }

        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(' + escaped + ')', 'ig');
        heading.innerHTML = heading.dataset.original.replace(
            regex,
            '<mark class="bg-yellow-300 text-black rounded px-0.5">$1</mark>'
        );
    }
}
