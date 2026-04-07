/* Intention: slider hero en fondu automatique + contrôle pause + menu mobile + reveal au scroll. */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (si Unsplash est bloqué / offline)
  const svgFallback = (label) => {
    const safe = String(label || "Image").slice(0, 40);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#111"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient></defs>` +
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

  // Slider
  const slides = Array.from(document.querySelectorAll("[data-slide]"));
  const dotsWrap = document.getElementById("dots");
  const pauseBtn = document.getElementById("pauseBtn");

  let index = 0;
  let paused = false;
  let timer = null;
  const intervalMs = 5200;

  const render = () => {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  };

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    render();
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => {
      if (!paused) go(index + 1);
    }, intervalMs);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  if (dotsWrap && slides.length) {
    dotsWrap.innerHTML = slides
      .map((_, i) => `<button class="dot ${i === 0 ? "is-active" : ""}" aria-label="Aller au slide ${i + 1}" data-dot="${i}"></button>`)
      .join("");
    dotsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dot]");
      if (!btn) return;
      go(Number(btn.getAttribute("data-dot")));
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.textContent = paused ? "Play" : "Pause";
    });
  }

  if (slides.length) start();

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
    { threshold: 0.12, rootMargin: "0px 0px -12% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
