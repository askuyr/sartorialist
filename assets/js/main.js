import { SITE_CONFIG, PHOTO_ITEMS } from "./config.js?v=14";

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

/* ---------- Section scroll spy ---------- */

const navLinks = $$(".nav__link");
const sectionLinks = new Map(
  navLinks
    .map((link) => [link.getAttribute("href")?.replace("#", ""), link])
    .filter(([id]) => Boolean(id)),
);

if ("IntersectionObserver" in window && sectionLinks.size) {
  const visibleSections = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.add(entry.target.id);
      else visibleSections.delete(entry.target.id);
    });

    const currentId = [...visibleSections]
      .sort((a, b) => document.getElementById(a).offsetTop - document.getElementById(b).offsetTop)[0];

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sectionLinks.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  });
}

/* ---------- Gallery ---------- */

const galleryRoot = $("#gallery-grid");

function renderGallery({ items }) {
  if (!galleryRoot) return;

  if (!items.length) {
    galleryRoot.innerHTML = `<p class="catalog-empty">Галерея пока не заполнена. <a class="text-link" data-avito-link href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}" target="_blank" rel="noopener">Лоты на Авито ↗</a></p>`;
    return;
  }

  galleryRoot.innerHTML = items.map((item, index) => {
    const image = item.image || "";
    const smallImage = image.replace(/\.webp$/, "-640.webp");
    const alt = item.alt || `Костюм ${index + 1}`;
    const height = item.wide ? 800 : 1800;

    return `<figure class="gallery__item">
      <img src="${escapeHtml(image)}" srcset="${escapeHtml(smallImage)} 640w, ${escapeHtml(image)} 1200w" sizes="(max-width: 700px) 44vw, (max-width: 900px) 29vw, 22vw" alt="${escapeHtml(alt)}" width="1200" height="${height}" loading="lazy" decoding="async">
    </figure>`;
  }).join("");
}

renderGallery({ items: PHOTO_ITEMS });
