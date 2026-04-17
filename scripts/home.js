/* ── MODULE: HOME ── */

function setActiveHomeTab(tab) {
  const subtitleEl = document.getElementById("homeHeaderSubtitle");
  const titleEl = document.getElementById("homeGreeting");
  const bannerEl = document.getElementById("welcomeBanner");

  const prevTab = window.__activeHomeTab || document.querySelector(".home-nav__item.is-active")?.getAttribute("data-tab") || "home";

  if (prevTab === "profile" && tab !== "profile" && window.__profileIsEditing) {
    window.__profileIsEditing = false;
    window.__profileDraft = null;

    const errorEl = document.getElementById("profileError");
    if (errorEl) errorEl.textContent = "";

    if (typeof window.renderProfile === "function") {
      try { window.renderProfile(window.__lastProfile || null); } catch (_) { }
    } else {
      try { renderProfile(window.__lastProfile || null); } catch (_) { }
    }
  }

  window.__activeHomeTab = tab;

  if (tab === "trail") {
    setTimeout(() => {
      initTrilhaToggle();
      resetTrilha();
    }, 0);
  }

  const tabMap = {
    home: "tabHome",
    trail: "tabTrail",
    messages: "tabMessages",
    library: "tabLibrary",
    profile: "tabProfile"
  };

  Object.keys(tabMap).forEach((key) => {
    const el = document.getElementById(tabMap[key]);
    if (!el) return;
    if (key === tab) el.classList.add("is-active");
    else el.classList.remove("is-active");
  });

  document.querySelectorAll(".home-nav__item").forEach((btn) => {
    const isActive = (btn.getAttribute("data-tab") || "") === tab;
    if (isActive) btn.classList.add("is-active");
    else btn.classList.remove("is-active");
  });

  if (titleEl && subtitleEl) {
    const currentName = (window.__homeFullName || "").trim();
    const greeting = currentName ? `Olá, ${currentName}` : "Olá";

    const map = {
      home:     { title: greeting,                   subtitle: "Bem-vindo à sua jornada de transformação ministerial" },
      trail:    { title: "Trilha de Aprendizado",    subtitle: "Sua jornada ministerial elevada ao nível máximo" },
      messages: { title: "Canal de Comunicação",     subtitle: "Mensagens diretas com o mentor" },
      library:  { title: "Biblioteca de Recursos",   subtitle: "Materiais exclusivos organizados por blocos temáticos" },
      profile:  { title: "Meu Perfil",               subtitle: "Dados pessoais e histórico ministerial" }
    };

    const content = map[tab] || map.home;
    titleEl.textContent = content.title;
    subtitleEl.textContent = content.subtitle;
  }

  if (bannerEl) {
    if (tab === "home") bannerEl.style.display = "";
    else bannerEl.style.display = "none";
  }

  if (typeof window.__updateWelcomeBannerLayout === "function" && tab === "home") {
    window.__updateWelcomeBannerLayout();
  }

  window.__activeHomeTab = tab;
}

function initWelcomeBanner() {
  const bannerEl = document.getElementById("welcomeBanner");
  const headerEl = document.querySelector(".home-header");
  const pageEl = document.querySelector(".home-page");
  if (!bannerEl || !headerEl || !pageEl) return;

  let lastKnownScrollY = 0;
  let ticking = false;

  const updateLayout = () => {
    const headerRect = headerEl.getBoundingClientRect();
    const bannerRect = bannerEl.getBoundingClientRect();

    const headerH = Math.max(0, Math.round(headerRect.height));
    const bannerH = Math.max(0, Math.round(bannerRect.height));
    const gap = 14;
    const topOffset = headerH + bannerH + gap;

    pageEl.style.setProperty("--home-header-height", `${headerH}px`);
    pageEl.style.setProperty("--home-top-offset", `${topOffset}px`);
  };

  const updateVisibility = (scrollY) => {
    const activeTab = document.querySelector(".home-nav__item.is-active")?.getAttribute("data-tab") || "home";
    if (activeTab !== "home") {
      bannerEl.classList.add("is-hidden");
      return;
    }

    if (scrollY > 20) bannerEl.classList.add("is-hidden");
    else bannerEl.classList.remove("is-hidden");
  };

  window.__updateWelcomeBannerLayout = () => {
    updateLayout();
    updateVisibility(window.scrollY || 0);
  };

  const onScroll = () => {
    lastKnownScrollY = window.scrollY || 0;
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateVisibility(lastKnownScrollY);
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", window.__updateWelcomeBannerLayout);

  window.__updateWelcomeBannerLayout();
}

function initAtividade1(user) {
  const openBtn = document.getElementById("btnAbrirAtividade");
  const statusEl = document.getElementById("atividade1Status");
  const overlay = document.getElementById("atividade1Modal");
  const form = document.getElementById("atividade1Form");
  const submitBtn = document.getElementById("atividade1Submit");
  const successOverlay = document.getElementById("atividade1SuccessModal");
  const successClose = document.getElementById("atividade1SuccessClose");

  if (!openBtn || !statusEl || !overlay || !form || !submitBtn || !successOverlay || !successClose) return;
  if (!firebase.firestore) return;

  const db = firebase.firestore();
  const docRef = db.collection("Atividade 1").doc(user.uid);

  const setAnsweredUi = (answered) => {
    if (answered) {
      statusEl.textContent = "Executada";
      statusEl.classList.add("is-visible");
      statusEl.setAttribute("aria-hidden", "false");
      openBtn.style.display = "none";
      openBtn.disabled = true;
    } else {
      statusEl.textContent = "";
      statusEl.classList.remove("is-visible");
      statusEl.setAttribute("aria-hidden", "true");
      openBtn.style.display = "";
      openBtn.disabled = false;
    }
  };

  const openOverlay = (el) => {
    lockPageScroll();
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
  };

  const closeOverlay = (el) => {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    unlockPageScroll();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target !== overlay) return;
    closeOverlay(overlay);
  });

  successOverlay.addEventListener("click", (e) => {
    if (e.target !== successOverlay) return;
    closeOverlay(successOverlay);
  });

  successClose.addEventListener("click", () => {
    closeOverlay(successOverlay);
  });

  let answered = false;
  docRef.onSnapshot(
    (snap) => {
      answered = !!snap?.exists;
      setAnsweredUi(answered);
    },
    () => {
      setAnsweredUi(false);
    }
  );

  openBtn.addEventListener("click", () => {
    if (answered) return;
    openOverlay(overlay);
    document.getElementById("atividade1Q1")?.focus();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (answered) return;

    const q1 = (document.getElementById("atividade1Q1")?.value || "").trim();
    const q2 = (document.getElementById("atividade1Q2")?.value || "").trim();
    const q3 = (document.getElementById("atividade1Q3")?.value || "").trim();
    const q4 = (document.getElementById("atividade1Q4")?.value || "").trim();

    submitBtn.disabled = true;

    docRef.set({
      uid: user.uid,
      email: user.email || "",
      profileDocId: window.__profileDocId || "",
      respostas: { q1, q2, q3, q4 },
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => {
        closeOverlay(overlay);
        openOverlay(successOverlay);
      })
      .catch(() => { })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });
}

function initHomePage() {
  const greetingEl = document.getElementById("homeGreeting");
  const profileErrorEl = document.getElementById("profileError");

  initLibrary();
  initEbookCarousel();
  initWelcomeBanner();

  function controlarBanner(tab) {
    const banner = document.getElementById("welcomeBanner");
    if (!banner) return;
    banner.style.display = tab === "home" ? "block" : "none";
  }

  document.querySelectorAll(".home-nav__item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      document.querySelectorAll(".home-tab").forEach(t => t.classList.remove("is-active"));
      document.querySelector(`#tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)
        ?.classList.add("is-active");

      document.querySelectorAll(".home-nav__item").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      resetTrilha();
    });
  });

  setActiveHomeTab("home");

  firebase.auth().onAuthStateChanged((user) => {
    if (typeof window.__profileUnsub === "function") {
      try { window.__profileUnsub(); } catch (_) { }
      window.__profileUnsub = null;
    }

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    if (!firebase.firestore) {
      if (profileErrorEl) profileErrorEl.textContent = "Firestore não está disponível.";
      return;
    }

    initAtividade1(user);

    const profilesCol = firebase.firestore().collection("profiles");
    const directRef = profilesCol.doc(user.uid);

    directRef.get()
      .then((snap) => {
        if (snap.exists) {
          window.__profileDocId = snap.id;
          window.__profileUnsub = directRef.onSnapshot(
            (doc) => {
              const profile = doc.exists ? (doc.data() || null) : null;
              window.__lastProfile = profile;
              if (profileErrorEl) profileErrorEl.textContent = "";

              const fullName = (profile?.fullName || user.displayName || "").trim();
              window.__homeFullName = fullName;
              if (greetingEl) {
                greetingEl.textContent = fullName ? `Olá, ${fullName}` : "Olá";
              }

              const activeTab = document.querySelector(".home-nav__item.is-active")?.getAttribute("data-tab") || "home";
              setActiveHomeTab(activeTab);

              if (!profile) {
                if (profileErrorEl) profileErrorEl.textContent = "Não foi possível carregar seu perfil.";
                renderProfile({ fullName, phone: "", email: user.email || "", church: "" });
                return;
              }

              if (window.__profileIsEditing) return;
              renderProfile(profile);
            },
            () => {
              if (profileErrorEl) profileErrorEl.textContent = "Não foi possível carregar seu perfil.";
            }
          );
          return;
        }

        const query = profilesCol.where("uid", "==", user.uid).limit(1);
        window.__profileUnsub = query.onSnapshot(
          (qs) => {
            const doc = qs.docs?.[0] || null;
            window.__profileDocId = doc ? doc.id : "";
            const profile = doc ? (doc.data() || null) : null;
            window.__lastProfile = profile;
            if (profileErrorEl) profileErrorEl.textContent = "";

            const fullName = (profile?.fullName || user.displayName || "").trim();
            window.__homeFullName = fullName;
            if (greetingEl) {
              greetingEl.textContent = fullName ? `Olá, ${fullName}` : "Olá";
            }

            const activeTab = document.querySelector(".home-nav__item.is-active")?.getAttribute("data-tab") || "home";
            setActiveHomeTab(activeTab);

            if (!profile) {
              if (profileErrorEl) profileErrorEl.textContent = "Não foi possível carregar seu perfil.";
              renderProfile({ fullName, phone: "", email: user.email || "", church: "" });
              return;
            }

            if (window.__profileIsEditing) return;
            renderProfile(profile);
          },
          () => {
            if (profileErrorEl) profileErrorEl.textContent = "Não foi possível carregar seu perfil.";
          }
        );
      })
      .catch(() => {
        if (profileErrorEl) profileErrorEl.textContent = "Não foi possível carregar seu perfil.";
      });
  });
}

if (document.getElementById("homeGreeting") || document.querySelector(".home-page")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomePage);
  } else {
    initHomePage();
  }
}
