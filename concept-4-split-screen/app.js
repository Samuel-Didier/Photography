/* Intention: image fixe qui change selon la section visible + menu mobile + reveal au scroll. */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (si Unsplash est bloqué / offline)
  const svgFallback = (label) => {
    const safe = String(label || "Image").slice(0, 40);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#0c0d10"/><stop offset="1" stop-color="#242834"/></linearGradient></defs>` +
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

  // Fixed image switching
  const fixedImg = document.getElementById("fixedImg");
  const blocks = Array.from(document.querySelectorAll("[data-fixed]"));

  const swapImage = (src) => {
    if (!fixedImg || !src) return;
    if (fixedImg.getAttribute("src") === src) return;
    fixedImg.style.opacity = "0";
    window.setTimeout(() => {
      fixedImg.setAttribute("src", src);
      fixedImg.style.transform = "scale(1.04)";
      fixedImg.style.opacity = "1";
      window.setTimeout(() => (fixedImg.style.transform = "scale(1.02)"), 250);
    }, 200);
  };

  if (fixedImg && blocks.length) {
    const ioFixed = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))[0];
        if (visible) swapImage(visible.target.getAttribute("data-fixed"));
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-10% 0px -55% 0px" }
    );
    blocks.forEach((b) => ioFixed.observe(b));
  }

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
    { threshold: 0.14, rootMargin: "0px 0px -12% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
