import { SITE_CONFIG } from "./config.js?v=15";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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

/* ---------- Gallery lightbox ---------- */

const galleryRoot = $("#gallery-grid");
const lightbox = $("#lightbox");

if (galleryRoot && lightbox && typeof lightbox.showModal === "function") {
  const lightboxImage = $(".lightbox__img", lightbox);

  galleryRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery__btn");
    if (!button) return;
    const image = $("img", button);
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.showModal();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.closest(".lightbox__close")) lightbox.close();
  });

  lightbox.addEventListener("close", () => lightboxImage.removeAttribute("src"));
}
