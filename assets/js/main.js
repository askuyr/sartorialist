import { CATALOG_SOURCE, SITE_CONFIG, PHOTO_ITEMS } from "./config.js";

const setLinks = (selector, url) => {
  document.querySelectorAll(selector).forEach((link) => {
    link.href = url;
  });
};

setLinks("[data-avito-link]", SITE_CONFIG.avitoProfileUrl);

const heroPhoto = document.querySelector("[data-hero-photo]");
if (heroPhoto && SITE_CONFIG.heroImage) {
  heroPhoto.src = SITE_CONFIG.heroImage;
}

const catalogRoot = document.querySelector("#catalog-content");
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

// Источник каталога переключается одной строкой в config.js: photos / avito.
async function prepareCatalogSource() {
  if (CATALOG_SOURCE === "photos") {
    return { mode: "photos", items: PHOTO_ITEMS };
  }

  if (CATALOG_SOURCE === "avito") {
    if (!SITE_CONFIG.avitoFeedUrl) return { mode: "avito-not-connected", items: [] };

    try {
      const response = await fetch(SITE_CONFIG.avitoFeedUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Feed error: ${response.status}`);
      const items = await response.json();
      return { mode: "avito", items: Array.isArray(items) ? items : [] };
    } catch (error) {
      console.error("Не удалось загрузить объявления Авито:", error);
      return { mode: "avito-error", items: [] };
    }
  }

  return { mode: "photos", items: PHOTO_ITEMS };
}

function renderCatalog(state) {
  if (!catalogRoot) return;

  if ((state.mode === "photos" || state.mode === "avito") && state.items.length) {
    catalogRoot.innerHTML = `
      <div class="catalog-grid">
        ${state.items.map((item, index) => {
          const image = item.image || "";
          const alt = item.alt || item.title || "Фотография мужского костюма";
          const title = item.title || "Мужской костюм";
          const url = item.url || SITE_CONFIG.avitoProfileUrl;
          return `
            <a class="catalog-card" href="${escapeHtml(url)}" target="_blank" rel="noopener"
               aria-label="${escapeHtml(title)} — открыть на Авито">
              <div class="catalog-image-wrap">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}"
                     loading="lazy" decoding="async">
                <span class="catalog-index">${String(index + 1).padStart(2, "0")}</span>
              </div>
              <div class="catalog-card-meta">
                <span>${escapeHtml(title)}</span>
                <span class="catalog-card-link">СМОТРЕТЬ НА АВИТО ↗</span>
              </div>
            </a>`;
        }).join("")}
      </div>`;
    return;
  }

  const message = state.mode === "avito-error"
    ? "Не удалось загрузить объявления. Перейдите в профиль Авито."
    : "Автоматическая загрузка объявлений пока не подключена.";
  catalogRoot.innerHTML = `
    <div class="catalog-empty">
      <span>${escapeHtml(message)}</span>
      <a class="text-link" href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}"
         target="_blank" rel="noopener">Перейти в профиль Авито ↗</a>
    </div>`;
}

prepareCatalogSource().then(renderCatalog);
window.sartorialistCatalog = prepareCatalogSource;

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }));
}
