window.toggleTheme = function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

(function () {
  function initSearch() {
    const toggle = document.getElementById("search-toggle");
    const panel = document.getElementById("search-panel");
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const close = document.getElementById("search-close");

    if (!toggle || !panel || !form || !input) return;

    function setSearchOpen(isOpen) {
      panel.classList.toggle("hidden", !isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        window.requestAnimationFrame(function () {
          input.focus();
        });
      }
    }

    toggle.addEventListener("click", function () {
      setSearchOpen(panel.classList.contains("hidden"));
    });

    if (close) {
      close.addEventListener("click", function () {
        setSearchOpen(false);
        toggle.focus();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      const searchUrl = form.dataset.searchUrl || "./src/pages/news-page.html";
      window.location.href = searchUrl + "?search=" + encodeURIComponent(query);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (
        !panel.classList.contains("hidden") &&
        !panel.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    });
  }

  function initReveal() {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (!revealItems.length) return;

    function reveal(item) {
      item.classList.remove("opacity-0", "translate-y-2");
      item.classList.add("opacity-100", "translate-y-0");
    }

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initMobileMenu() {
    const btn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const iconOpen = document.getElementById("mobile-menu-icon-open");
    const iconClose = document.getElementById("mobile-menu-icon-close");

    if (!btn || !menu || !iconOpen || !iconClose) return;

    btn.addEventListener("click", function () {
      const isHidden = menu.classList.contains("hidden");
      menu.classList.toggle("hidden");
      iconOpen.classList.toggle("hidden");
      iconClose.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSearch();
    initReveal();
    initMobileMenu();
  });
})();
