import { CATALOG_SOURCE, SITE_CONFIG, PHOTO_ITEMS } from "./config.js";

// Keep every Avito link in one place so the profile URL is easy to change.
document.querySelectorAll("[data-avito-link]").forEach((link) => {
  link.href = SITE_CONFIG.avitoProfileUrl;
});

const catalogRoot = document.querySelector("#catalog-content");
const escapeHtml = (value = "") => String(value).replace(/[&<>\"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

async function getCatalog() {
  if (CATALOG_SOURCE === "photos") return { mode: "photos", items: PHOTO_ITEMS };
  if (CATALOG_SOURCE === "avito" && SITE_CONFIG.avitoFeedUrl) {
    try {
      const response = await fetch(SITE_CONFIG.avitoFeedUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Feed error: ${response.status}`);
      const items = await response.json();
      return { mode: "avito", items: Array.isArray(items) ? items : [] };
    } catch (error) {
      console.error("Avito feed error", error);
      return { mode: "error", items: [] };
    }
  }
  if (CATALOG_SOURCE === "avito") return { mode: "not-connected", items: [] };
  return { mode: "photos", items: PHOTO_ITEMS };
}

function renderCatalog({ mode, items }) {
  if (!catalogRoot) return;
  if (items.length) {
    catalogRoot.innerHTML = `<div class="catalog-grid">${items.map((item, i) => {
      const image = item.image || "";
      const alt = item.alt || "Фотография мужского костюма";
      const url = item.url || SITE_CONFIG.avitoProfileUrl;
      return `<a class="catalog-card" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="Открыть профиль Авито">
        <div class="catalog-image">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
          <span class="catalog-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="catalog-open">ПРОФИЛЬ АВИТО ↗</span>
        </div>
        <div class="catalog-meta"><strong>Фотография ${String(i + 1).padStart(2, "0")}</strong><small>THE SARTORIALIST CLUB</small></div>
      </a>`;
    }).join("")}</div>`;
    return;
  }
  const text = mode === "error" ? "Не удалось загрузить объявления." : "Каталог объявлений пока не подключён.";
  catalogRoot.innerHTML = `<div class="catalog-empty"><span>${text}</span><a class="under-link" href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}" target="_blank" rel="noopener">Перейти в профиль <span>↗</span></a></div>`;
}

getCatalog().then(renderCatalog);

const menuButton = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }));
}
