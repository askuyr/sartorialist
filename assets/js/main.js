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

function renderCatalog({ items }) {
  if (!catalogRoot) return;

  const totalNode = $("[data-rail-total]");

  if (!items.length) {
    if (totalNode) totalNode.textContent = "00";
    catalogRoot.innerHTML = `<p class="catalog-empty"><span>Каталог пока не заполнен.</span><a class="link-underline" data-avito-link href="${escapeHtml(SITE_CONFIG.avitoProfileUrl)}" target="_blank" rel="noopener">Перейти в профиль <span aria-hidden="true">↗</span></a></p>`;
    const avitoLink = $("[data-avito-link]", catalogRoot);
    if (avitoLink) avitoLink.href = SITE_CONFIG.avitoProfileUrl;
    return;
  }

  if (totalNode) totalNode.textContent = String(items.length).padStart(2, "0");

  const cards = items.map((item, index) => {
    const number = String(index + 1).padStart(2, "0");
    const name = item.name || `Костюм ${number}`;
    const alt = item.alt || name;
    const url = item.url || SITE_CONFIG.avitoProfileUrl;
    const image = item.image || "";
    const smallImage = image.replace(/\.webp$/, "-640.webp");
    const srcset = image.endsWith(".webp")
      ? ` srcset="${escapeHtml(smallImage)} 640w, ${escapeHtml(image)} 1000w" sizes="(max-width: 700px) 74vw, 23vw"`
      : "";

    return `<article class="product" style="--i:${index}">
      <a class="product__link" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <div class="product__media">
          <img src="${escapeHtml(image)}"${srcset} alt="${escapeHtml(alt)}" width="1000" height="1500" loading="lazy" decoding="async">
          <span class="product__no">${number}</span>
          <span class="product__view"><span>Костюмы на Авито</span><span aria-hidden="true">↗</span></span>
        </div>
        <div class="product__meta">
          <div>
            <h3 class="product__name">${escapeHtml(name)}</h3>
            <p class="product__sub">Референс ${number}</p>
          </div>
          <span class="product__arrow" aria-hidden="true">↗</span>
        </div>
      </a>
    </article>`;
  }).join("");

  catalogRoot.innerHTML = `
    <div class="catalog-rail" data-rail tabindex="0" role="region" aria-label="Референсы костюмов">
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

renderCatalog({ items: PHOTO_ITEMS });
