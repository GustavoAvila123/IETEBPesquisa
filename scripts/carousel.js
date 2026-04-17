/* ── MODULE: CAROUSEL ── */

function initEbookCarousel() {
  const carouselEl = document.getElementById("ebookCarousel");
  const viewportEl = document.getElementById("ebookCarouselViewport");
  const trackEl = document.getElementById("ebookCarouselTrack");
  if (!carouselEl || !viewportEl || !trackEl) return;

  const dots = Array.from(carouselEl.querySelectorAll(".home-carousel__dot"));
  const slides = Array.from(trackEl.querySelectorAll(".home-carousel__slide"));
  const count = slides.length;
  if (count <= 1) return;

  let index = 0;
  let autoplayId = 0;
  let userInteractedAt = 0;

  let isDragging = false;
  let startX = 0;
  let dragDx = 0;

  const setIndex = (next, opts = {}) => {
    const { animate = true, userAction = false } = opts;
    const normalized = ((next % count) + count) % count;
    index = normalized;

    trackEl.style.transition = animate ? "transform 0.45s ease" : "none";
    trackEl.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((d) => {
      const i = Number(d.getAttribute("data-index") || "0");
      d.classList.toggle("is-active", i === index);
    });

    if (userAction) userInteractedAt = Date.now();
  };

  const scheduleAutoplay = () => {
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => {
      const activeTab = document.querySelector(".home-nav__item.is-active")?.getAttribute("data-tab") || "home";
      if (activeTab !== "home") return;
      if (!document.body.contains(carouselEl)) return;
      if (Date.now() - userInteractedAt < 4000) return;
      setIndex(index + 1, { animate: true });
    }, 15000);
  };

  dots.forEach((d) => {
    d.addEventListener("click", () => {
      const i = Number(d.getAttribute("data-index") || "0");
      setIndex(i, { animate: true, userAction: true });
    });
  });

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    dragDx = 0;
    trackEl.style.transition = "none";
    try { viewportEl.setPointerCapture(e.pointerId); } catch (_) { }
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    dragDx = e.clientX - startX;
    const px = -index * viewportEl.clientWidth + dragDx;
    trackEl.style.transform = `translateX(${px}px)`;
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { viewportEl.releasePointerCapture(e.pointerId); } catch (_) { }

    const w = Math.max(1, viewportEl.clientWidth);
    const threshold = Math.min(120, Math.round(w * 0.18));
    if (Math.abs(dragDx) > threshold) {
      const dir = dragDx < 0 ? 1 : -1;
      setIndex(index + dir, { animate: true, userAction: true });
    } else {
      setIndex(index, { animate: true });
    }

    dragDx = 0;
  };

  viewportEl.addEventListener("pointerdown", onPointerDown);
  viewportEl.addEventListener("pointermove", onPointerMove);
  viewportEl.addEventListener("pointerup", onPointerUp);
  viewportEl.addEventListener("pointercancel", onPointerUp);
  viewportEl.addEventListener("dragstart", (e) => e.preventDefault());

  setIndex(0, { animate: false });
  scheduleAutoplay();
}
