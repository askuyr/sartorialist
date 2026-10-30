import { CATALOG_SOURCE, SITE_CONFIG, PHOTO_ITEMS } from "./config.js";

const setLinks = (selector, url) => {
  document.querySelectorAll(selector).forEach((link) => {
    link.href = url;
  });
};

setLinks("[data-avito-link]", SITE_CONFIG.avitoProfileUrl);
setLinks("[data-gallery-link]", SITE_CONFIG.galleryUrl);

const firstPhoto = PHOTO_ITEMS[0];
if (firstPhoto) {
  const heroPhoto = document.querySelector("[data-hero-photo]");
  if (heroPhoto) {
    heroPhoto.src = firstPhoto.image;
    heroPhoto.alt = firstPhoto.alt;
  }
}

const catalogRoot = document.querySelector("#catalog-content");
const escapeHtml = (value = "") => String(value).replace(/[&<>\"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

// Переключатель источника каталога: photos / avito.
// В карточках намеренно не выводятся цены и размеры.
async function prepareCatalogSource() {
  if (CATALOG_SOURCE === "photos") {
    return { mode: "photos", items: PHOTO_ITEMS };
  }

  if (CATALOG_SOURCE === "avito") {
    if (!SITE_CONFIG.avitoFeedUrl) return { mode: "avito-not-connected", items: [] };
    try {
      const response = await fetch(SITE_CONFIG.avitoFeedUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Feed error: ${response.status}`);
      const items = await response.json();
      return { mode: "avito", items: Array.isArray(items) ? items : [] };
    } catch (error) {
      console.error("Не удалось загрузить ленту Авито:", error);
      return { mode: "avito-error", items: [] };
    }
  }

  return { mode: "photos", items: PHOTO_ITEMS };
}

function renderCatalog(state) {
  if (!catalogRoot) return;
  if (state.mode === "photos") {
    if (state.items.length > 1) {
      catalogRoot.innerHTML = `<div class=\"catalog-grid\">${state.items.map((item) => `
        <a class=\"catalog-card\" href=\"${escapeHtml(SITE_CONFIG.galleryUrl)}\" target=\"_blank\" rel=\"noopener\">
          <img src=\"${escapeHtml(item.image)}\" alt=\"${escapeHtml(item.alt || 'Фотография костюма')}\" loading=\"lazy\">
          <span>ОТКРЫТЬ ФОТОГАЛЕРЕЮ ↗</span>
        </a>`).join("")}</div>`;
    } else {
      catalogRoot.innerHTML = `<div class=\"catalog-empty\"><span>ФОТОГАЛЕРЕЯ</span><a class=\"text-link\" href=\"${escapeHtml(SITE_CONFIG.galleryUrl)}\" target=\"_blank\" rel=\"noopener\">Открыть фотографии ↗</a></div>`;
    }
    return;
  }

  if (state.mode === "avito" && state.items.length) {
    catalogRoot.innerHTML = `<div class=\"catalog-grid\">${state.items.map((item) => `
      <a class=\"catalog-card\" href=\"${escapeHtml(item.url || SITE_CONFIG.avitoProfileUrl)}\" target=\"_blank\" rel=\"noopener\">
        ${item.image ? `<img src=\"${escapeHtml(item.image)}\" alt=\"${escapeHtml(item.title || 'Фотография объявления')}\" loading=\"lazy\">` : ""}
        <span>${escapeHtml(item.title || "ОТКРЫТЬ ОБЪЯВЛЕНИЕ")} ↗</span>
      </a>`).join("")}</div>`;
    return;
  }

  const message = state.mode === "avito-error" ? "Не удалось загрузить объявления. Откройте профиль Авито." : "Интеграция Авито пока не подключена. Актуальные объявления доступны в профиле.";
  catalogRoot.innerHTML = `<div class=\"catalog-empty\"><span>${escapeHtml(message)}</span><a class=\"text-link\" href=\"${escapeHtml(SITE_CONFIG.avitoProfileUrl)}\" target=\"_blank\" rel=\"noopener\">Перейти в профиль Авито ↗</a></div>`;
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
