/* ── MODULE: UTILS ── */

// Zoom / gesture / double-tap prevention
(() => {
  if (window.__zoomBlockInstalled) return;
  window.__zoomBlockInstalled = true;

  const prevent = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
  };

  document.addEventListener("gesturestart", prevent, { passive: false });
  document.addEventListener("gesturechange", prevent, { passive: false });
  document.addEventListener("gestureend", prevent, { passive: false });

  document.addEventListener(
    "wheel",
    (e) => {
      if (e && e.ctrlKey) prevent(e);
    },
    { passive: false }
  );

  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      const target = e?.target;
      const tag = target?.tagName ? String(target.tagName).toUpperCase() : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        lastTouchEnd = now;
        return;
      }

      if (now - lastTouchEnd <= 300) {
        prevent(e);
      }

      lastTouchEnd = now;
    },
    { passive: false }
  );
})();

function getQueryParam(name) {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
  } catch (_) {
    return "";
  }
}

function setFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message || "";
}

function setFieldSuccess(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message || "";
}

function lockPageScroll() {
  const n = (window.__modalLocks || 0) + 1;
  window.__modalLocks = n;
  if (n === 1) {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    window.__lockedScrollY = scrollY;
    document.body.classList.add("modal-open");
    document.body.style.top = `-${scrollY}px`;
  }
}

function unlockPageScroll() {
  const n = Math.max(0, (window.__modalLocks || 0) - 1);
  window.__modalLocks = n;
  if (n === 0) {
    document.body.classList.remove("modal-open");
    const scrollY = Number(window.__lockedScrollY || 0);
    document.body.style.top = "";
    window.__lockedScrollY = 0;
    window.scrollTo(0, scrollY);
  }
}
