/* Intention: conversion scroll vertical -> translation horizontale (desktop/tablet), avec hauteur “virtuelle” et reveal au scroll. */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (si Unsplash est bloqué / offline)
  const svgFallback = (label) => {
    const safe = String(label || "Image").slice(0, 40);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#0f1115"/><stop offset="1" stop-color="#2a2d36"/></linearGradient></defs>` +
      `<rect width="1600" height="900" fill="url(#g)"/>` +
      `<rect x="70" y="70" width="1460" height="760" rx="26" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.10)"/>` +
      `<text x="800" y="485" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="42" text-anchor="middle" fill="rgba(255,255,255,.55)">` +
      `${safe}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "true";
        img.src = svgFallback(img.alt || "Placeholder");
      },
      { once: true }
    );
  });

  // Mobile menu
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("menu");
  if (burger && menu) {
    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => e.target.matches("a") && setOpen(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !burger.contains(e.target)) setOpen(false);
    });
  }

  const wrap = document.getElementById("storyWrap");
  const rail = document.getElementById("rail");

  const isMobile = () => window.matchMedia("(max-width: 820px)").matches;

  const syncHeight = () => {
    if (!wrap || !rail) return;
    if (isMobile()) {
      wrap.style.height = "auto";
      rail.style.transform = "none";
      return;
    }
    const railWidth = rail.scrollWidth;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const virtualHeight = Math.max(vh, railWidth - vw + vh);
    wrap.style.height = `${virtualHeight}px`;
  };

  const onScroll = () => {
    if (!wrap || !rail || isMobile()) return;
    const rect = wrap.getBoundingClientRect();
    const start = rect.top * -1;
    const maxTranslate = rail.scrollWidth - window.innerWidth;
    const x = Math.max(0, Math.min(maxTranslate, start));
    rail.style.transform = `translate3d(${-x}px,0,0)`;
  };

  window.addEventListener("resize", () => {
    syncHeight();
    onScroll();
  }, { passive: true });

  window.addEventListener("scroll", onScroll, { passive: true });

  syncHeight();
  onScroll();

  // Reveal on scroll
  const els = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
