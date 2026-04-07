/* Intention: interactions discrètes (hamburger), apparitions au scroll via IntersectionObserver, sans perturber le minimalisme. */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (si Unsplash est bloqué / offline)
  const svgFallback = (label) => {
    const safe = String(label || "Image").slice(0, 40);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#f3f3f3"/><stop offset="1" stop-color="#d9d9d9"/></linearGradient></defs>` +
      `<rect width="1200" height="800" fill="url(#g)"/>` +
      `<rect x="60" y="60" width="1080" height="680" rx="24" fill="rgba(255,255,255,.55)" stroke="rgba(0,0,0,.10)"/>` +
      `<text x="600" y="420" font-family="Georgia, serif" font-size="38" text-anchor="middle" fill="rgba(0,0,0,.45)">` +
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
  const nav = document.getElementById("menu");

  if (burger && nav) {
    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };

    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    nav.addEventListener("click", (e) => {
      if (e.target && e.target.matches("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (e) => {
      const isClickInside = nav.contains(e.target) || burger.contains(e.target);
      if (!isClickInside) setOpen(false);
    });
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
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el) => io.observe(el));
})();
