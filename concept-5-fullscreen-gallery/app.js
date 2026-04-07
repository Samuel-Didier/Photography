/* Intention: navigation immersive (clic/scroll/clavier), transitions zoom, menu mobile, reveal au scroll (info). */
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (si Unsplash est bloqué / offline)
  const svgFallback = (label) => {
    const safe = String(label || "Image").slice(0, 40);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="#060607"/><stop offset="1" stop-color="#2a2a2d"/></linearGradient></defs>` +
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

  // Fullscreen gallery
  const shots = Array.from(document.querySelectorAll("[data-shot]"));
  const nextBtn = document.getElementById("nextBtn");
  const stack = document.getElementById("stack");
  let index = 0;

  const show = (i) => {
    if (!shots.length) return;
    index = (i + shots.length) % shots.length;
    shots.forEach((s, k) => s.classList.toggle("is-active", k === index));
    if (stack) stack.setAttribute("aria-label", `Photo ${index + 1} sur ${shots.length}`);
  };

  const next = () => show(index + 1);
  const prev = () => show(index - 1);

  if (nextBtn) nextBtn.addEventListener("click", next);

  // Click anywhere to go next (except UI)
  document.addEventListener("click", (e) => {
    const isUI = e.target.closest(".hud, .tap, .info, .menu");
    if (!isUI) next();
  });

  // Scroll to change (throttled)
  let wheelLock = false;
  window.addEventListener("wheel", (e) => {
    if (wheelLock) return;
    wheelLock = true;
    (e.deltaY > 0 ? next : prev)();
    window.setTimeout(() => (wheelLock = false), 420);
  }, { passive: true });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
  });

  // Menu jump to index
  if (menu) {
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("[data-jump]");
      if (!a) return;
      e.preventDefault();
      show(Number(a.getAttribute("data-jump")));
    });
  }

  show(0);

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
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
