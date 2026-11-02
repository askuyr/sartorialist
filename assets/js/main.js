import { SITE_CONFIG, PHOTO_ITEMS } from "./config.js?v=13";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- Shared links ---------- */

$$("[data-avito-link]").forEach((link) => {
  link.href = SITE_CONFIG.avitoProfileUrl;
  link.target = "_blank";
  link.rel = "noopener";
});

$$("[data-gallery-link]").forEach((link) => {
  link.href = SITE_CONFIG.galleryUrl;
  link.target = "_blank";
  link.rel = "noopener";
});

const phoneHref = SITE_CONFIG.phone ? `tel:${String(SITE_CONFIG.phone).replace(/[^\d+]/g, "")}` : "";
if (phoneHref) {
  $$("[data-phone-link]").forEach((link) => { link.href = phoneHref; });
} else {
  $$("[data-phone-link]").forEach((link) => link.remove());
}

/* ---------- Sticky header ---------- */

const header = $(".header");
if (header) {
  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

/* ---------- Mobile navigation ---------- */

const nav = $("#nav");
const navToggle = $(".nav-toggle");
const mobileQuery = window.matchMedia("(max-width: 900px)");

function closeNav() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeNav();
      return;
    }
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("menu-open");
  });

  $$("a", nav).forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  const handleBreakpoint = (event) => {
    if (!event.matches) closeNav();
  };
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleBreakpoint);
  } else {
    mobileQuery.addListener(handleBreakpoint);
  }
}

/* ---------- Scroll reveal ---------- */

const revealItems = $$(".reveal");
const canObserve = "IntersectionObserver" in window && !prefersReducedMotion.matches;

if (canObserve) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((element) => revealObserver.observe(element));
} else {
  revealItems.forEach((element) => element.classList.add("is-visible"));
}

/* ---------- Suit index with preview ---------- */

const catalogRoot = $("#catalog-content");
const previewRoot = $("#lot-preview");

function renderCatalog({ items }) {
  if (!catalogRoot) return;

  if (!items.length) {
    catalogRoot.innerHTML = `<p class="catalog-empty">Список пока не заполнен. <a class="text-link" data-avito-link href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}" target="_blank" rel="noopener">Открыть профиль на Авито ↗</a></p>`;
    return;
  }

  const rows = items.map((item, index) => {
    const name = item.name || `Костюм ${index + 1}`;
    const image = item.image || "";
    const smallImage = image.replace(/\.webp$/, "-640.webp");

    return `<button class="lot-row" type="button" data-lot="${index}" data-image="${escapeHtml(image)}" data-name="${escapeHtml(name)}">
      <img class="lot-row__thumb" src="${escapeHtml(smallImage)}" alt="" width="64" height="85" loading="lazy" decoding="async">
      <span class="lot-row__name">${escapeHtml(name)}</span>
      <span class="lot-row__arrow" aria-hidden="true">↗</span>
    </button>`;
  }).join("");

  catalogRoot.innerHTML = `<div class="lots__list">${rows}</div>`;
  initIndex(items);
}

function initIndex(items) {
  if (!catalogRoot || !previewRoot) return;

  const rows = $$(".lot-row", catalogRoot);
  const layers = $$("img", previewRoot);
  const captionName = $("[data-lot-name]", previewRoot);
  if (!rows.length || layers.length < 2) return;

  let front = 0;

  const show = (index) => {
    const item = items[index];
    if (!item) return;

    const next = layers[1 - front];
    next.src = item.image;
    next.alt = item.alt || item.name || "";
    next.classList.add("is-on");
    layers[front].classList.remove("is-on");
    front = 1 - front;

    if (captionName) captionName.textContent = item.name || "";
    rows.forEach((row, rowIndex) => row.classList.toggle("is-active", rowIndex === index));
  };

  rows.forEach((row, index) => {
    row.addEventListener("mouseenter", () => show(index));
    row.addEventListener("focus", () => show(index));
    row.addEventListener("click", () => show(index));
  });

  show(0);
}

renderCatalog({ items: PHOTO_ITEMS });
