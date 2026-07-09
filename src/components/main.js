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


  function initSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("search") || "").trim();
    if (!query) return;

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = query;
    }

    const cards = Array.from(document.querySelectorAll('main a[href*="detail-pages"]'));
    const header = document.querySelector("main header");
    if (!cards.length || !header) return;

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
      });
    }

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let matchCount = 0;

    cards.forEach(function (card) {
      const text = card.textContent.toLowerCase();
      const isMatch = terms.every(function (term) {
        return text.includes(term);
      });
      card.dataset.searchMatch = isMatch ? "true" : "false";
      card.classList.toggle("hidden", !isMatch);
      if (isMatch) matchCount += 1;
    });

    Array.from(document.querySelectorAll("main [data-reveal]")).forEach(function (section) {
      if (section.matches('a[href*="detail-pages"]')) return;
      const sectionCards = Array.from(section.querySelectorAll('a[href*="detail-pages"]'));
      if (!sectionCards.length) return;
      const hasMatch = sectionCards.some(function (card) {
        return card.dataset.searchMatch === "true";
      });
      section.classList.toggle("hidden", !hasMatch);
    });

    const summary = document.createElement("div");
    summary.className = "mt-5 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";
    summary.innerHTML = matchCount
      ? '<span class="font-bold text-gray-900 dark:text-white">' + matchCount + '</span> result' + (matchCount === 1 ? "" : "s") + ' for <span class="font-bold text-red-600">' + escapeHtml(query) + '</span>. <a class="ml-2 font-bold text-red-600 hover:text-red-700" href="' + window.location.pathname + '">Clear search</a>'
      : 'No stories found for <span class="font-bold text-red-600">' + escapeHtml(query) + '</span>. <a class="ml-2 font-bold text-red-600 hover:text-red-700" href="' + window.location.pathname + '">Show all stories</a>';
    header.appendChild(summary);
  }

  function initReveal() {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (!revealItems.length) return;

    function reveal(item, delay) {
      window.setTimeout(function () {
        item.classList.remove("opacity-0", "translate-y-2");
        item.classList.add("opacity-100", "translate-y-0");
      }, delay || 0);
    }

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .forEach(function (entry, index) {
            reveal(entry.target, index * 90);
            observer.unobserve(entry.target);
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


  function initSubscribeOverlay() {
    const subscribeLinks = Array.from(document.querySelectorAll('[data-subscribe-open]'));
    if (!subscribeLinks.length) return;

    const modal = document.createElement("div");
    modal.id = "subscribe-modal";
    modal.className = "fixed inset-0 z-[100] hidden items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="absolute inset-0" data-subscribe-close aria-hidden="true"></div>
      <section role="dialog" aria-modal="true" aria-labelledby="subscribe-modal-title" class="relative w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <button type="button" data-subscribe-close class="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 transition hover:text-red-600 dark:bg-gray-950/90 dark:text-gray-300" aria-label="Close subscribe dialog">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="grid grid-cols-1 md:grid-cols-5">
          <div class="relative min-h-56 bg-[#1C1C1C] md:col-span-2">
            <div class="absolute inset-0 bg-linear-to-br from-red-600/85 via-[#1C1C1C] to-black"></div>
            <div class="relative flex h-full flex-col justify-between p-6 text-white">
              <p class="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide"><span class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>Up News</p>
              <div>
                <h2 id="subscribe-modal-title" class="text-3xl font-extrabold uppercase leading-tight">Subscribe To<br />Up News</h2>
                <p class="mt-12 text-sm leading-relaxed text-gray-200">Get weekly updates on the stories shaping business, culture, sport, and world affairs.</p>
              </div>
            </div>
          </div>
          <div class="md:col-span-3 p-6 sm:p-8">
            <p class="text-xs font-bold uppercase tracking-wide text-red-600">Newsletter</p>
            <h3 class="mt-2 text-2xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">No Spam, Just The Brief</h3>
            <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">A clean weekly email with the top headlines and editor picks from Up News.</p>
            <form id="subscribe-modal-form" class="mt-6 space-y-4">
              <label for="subscribe-email" class="sr-only">Email address</label>
              <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center">
                <div class="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <input id="subscribe-email" type="email" required placeholder="you@example.com" class="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white" />
                </div>
                <button type="submit" class="cursor-pointer rounded-sm bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 active:scale-95">Subscribe</button>
              </div>
              <p id="subscribe-modal-message" class="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">Free weekly briefing. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(modal);

    const dialog = modal.querySelector('[role="dialog"]');
    const email = modal.querySelector("#subscribe-email");
    const form = modal.querySelector("#subscribe-modal-form");
    const message = modal.querySelector("#subscribe-modal-message");
    let lastFocused = null;

    function setOpen(isOpen) {
      modal.classList.toggle("hidden", !isOpen);
      modal.classList.toggle("flex", isOpen);
      document.body.classList.toggle("overflow-hidden", isOpen);
      if (isOpen) {
        lastFocused = document.activeElement;
        window.requestAnimationFrame(function () {
          email.focus();
        });
      } else if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    subscribeLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        setOpen(true);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target.closest("[data-subscribe-close]")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        setOpen(false);
      }
      if (event.key !== "Tab" || modal.classList.contains("hidden")) return;

      const focusable = Array.from(dialog.querySelectorAll('button, input, a, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (item) {
        return !item.disabled && item.offsetParent !== null;
      });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      message.textContent = "You're subscribed. Welcome to the Up News briefing.";
      message.classList.remove("text-gray-500", "dark:text-gray-400");
      message.classList.add("text-red-600");
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSearch();
    initSearchResults();
    initReveal();
    initMobileMenu();
    initSubscribeOverlay();
  });
})();
