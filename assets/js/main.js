import { CATALOG_SOURCE, SITE_CONFIG, PHOTO_ITEMS } from "./config.js?v=10";

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

/* ---------- Catalog ---------- */

const catalogRoot = $("#catalog-content");

async function fetchAvitoData() {
  const url = `${SITE_CONFIG.avitoDataUrl}?v=${Date.now()}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Avito data error: ${response.status}`);
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(items) ? items : [];
}

async function getCatalog() {
  if (CATALOG_SOURCE === "photos") return { mode: "photos", items: PHOTO_ITEMS };

  if (CATALOG_SOURCE === "feed" && SITE_CONFIG.avitoFeedUrl) {
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

  if (CATALOG_SOURCE === "avito") {
    try {
      const items = await fetchAvitoData();
      if (items.length) return { mode: "avito", items };
      return { mode: "photos", items: PHOTO_ITEMS };
    } catch {
      return { mode: "photos", items: PHOTO_ITEMS };
    }
  }

  return { mode: "photos", items: PHOTO_ITEMS };
}

const rubles = new Intl.NumberFormat("ru-RU");

function formatPrice(item) {
  if (item.priceText) return String(item.priceText);
  const value = Number(item.price);
  if (!Number.isFinite(value) || value <= 0) return "";
  return `${rubles.format(value)} ₽`;
}

function safeItemUrl(value) {
  try {
    const url = new URL(value, location.href);
    if (url.protocol === "https:" && /(^|\.)avito\.ru$/i.test(url.hostname)) return url.href;
  } catch {
    /* ignore */
  }
  return SITE_CONFIG.avitoProfileUrl;
}

function renderCatalog({ mode, items }) {
  if (!catalogRoot) return;

  const totalNode = $("[data-rail-total]");
  const sourceNode = $("[data-rail-source]");
  if (sourceNode) sourceNode.textContent = mode === "avito" ? "объявления и цены с Авито" : "фотографии";

  if (!items.length) {
    if (totalNode) totalNode.textContent = "00";
    const message = mode === "error"
      ? "Не удалось загрузить объявления."
      : "Каталог объявлений пока не подключён.";
    catalogRoot.innerHTML = `<p class="catalog-empty"><span>${message}</span><a class="link-underline" data-avito-link href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}" target="_blank" rel="noopener">Перейти в профиль <span aria-hidden="true">↗</span></a></p>`;
    const avitoLink = $("[data-avito-link]", catalogRoot);
    if (avitoLink) avitoLink.href = SITE_CONFIG.avitoProfileUrl;
    return;
  }

  if (totalNode) totalNode.textContent = String(items.length).padStart(2, "0");

  const cards = items.map((item, index) => {
    const number = String(index + 1).padStart(2, "0");
    const name = item.title || item.name || `Костюм ${number}`;
    const alt = item.alt || item.title || name;
    const url = mode === "avito" ? safeItemUrl(item.url) : (item.url || SITE_CONFIG.avitoProfileUrl);
    const price = mode === "avito" ? formatPrice(item) : "";
    const sub = mode === "avito" ? "Авито" : `Фотография ${number}`;
    const image = item.image || "";

    return `<article class="product" style="--i:${index}">
      <a class="product__link" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <div class="product__media">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          <span class="product__no">${number}</span>
          <span class="product__view"><span>Открыть в Авито</span><span aria-hidden="true">↗</span></span>
        </div>
        <div class="product__meta">
          <div>
            <h3 class="product__name">${escapeHtml(name)}</h3>
            ${price ? `<p class="product__price">${escapeHtml(price)}</p>` : ""}
            <p class="product__sub">${escapeHtml(sub)}</p>
          </div>
          <span class="product__arrow" aria-hidden="true">↗</span>
        </div>
      </a>
    </article>`;
  }).join("");

  catalogRoot.innerHTML = `
    <div class="catalog-rail" data-rail tabindex="0" role="region" aria-label="Фотографии коллекции">
      ${cards}
    </div>
    <div class="rail-progress" aria-hidden="true"><span></span></div>
  `;

  initRail();
}

function initRail() {
  const rail = $("[data-rail]", catalogRoot);
  const previous = $("[data-rail-prev]");
  const next = $("[data-rail-next]");
  const current = $("[data-rail-current]");
  const progress = $(".rail-progress span", catalogRoot);
  if (!rail) return;

  const cards = $$(".product", rail);
  if (!cards.length) return;

  const gap = () => parseFloat(getComputedStyle(rail).columnGap) || 0;
  const step = () => cards[0].getBoundingClientRect().width + gap();
  const maxScroll = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

  const update = () => {
    const max = maxScroll();
    const x = rail.scrollLeft;
    const firstVisible = cards.findIndex((card) => card.offsetLeft + card.offsetWidth > x + 8);
    const index = firstVisible === -1 ? cards.length : firstVisible + 1;

    if (current) current.textContent = String(index).padStart(2, "0");
    if (previous) previous.disabled = x <= 2;
    if (next) next.disabled = x >= max - 2;

    if (progress) {
      const thumb = Math.min(1, rail.clientWidth / rail.scrollWidth);
      const ratio = max > 0 ? x / max : 0;
      progress.style.width = `${Math.max(thumb, 0.1) * 100}%`;
      progress.style.transform = `translateX(${ratio * (1 / Math.max(thumb, 0.1) - 1) * 100}%)`;
    }
  };

  let frame = 0;
  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  const scrollByCards = (direction) => {
    const cardsPerView = window.innerWidth > 900 ? 2 : 1;
    rail.scrollBy({
      left: direction * step() * cardsPerView,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  };

  previous?.addEventListener("click", () => scrollByCards(-1));
  next?.addEventListener("click", () => scrollByCards(1));
  rail.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });

  rail.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCards(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCards(-1);
    }
  });

  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    isDown = true;
    dragged = false;
    startX = event.clientX;
    startLeft = rail.scrollLeft;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isDown) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 5) dragged = true;
    rail.scrollLeft = startLeft - delta;
  });

  const endDrag = (event) => {
    if (!isDown) return;
    isDown = false;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  };

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);
  rail.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);

  update();
}

getCatalog().then(renderCatalog);
