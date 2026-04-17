/* ── MODULE: AUTH ── */

// Depends on: firebase-config, utils, validation

function ensurePhoneNotInUse(phone) {
  const value = (phone || "").trim();
  if (!value) return Promise.resolve();
  if (!firebase.firestore) return Promise.resolve();

  return firebase.firestore().collection("profiles")
    .where("phone", "==", value)
    .limit(1)
    .get()
    .then((snap) => {
      if (!snap.empty) {
        const err = new Error("Telefone já cadastrado.");
        err.code = "phone-already-in-use";
        throw err;
      }
    })
    .catch((err) => {
      if (err?.code === "phone-already-in-use") throw err;
      return;
    });
}

function getRegisterErrorMessage(err) {
  const code = err?.code || "";

  if (code === "phone-already-in-use") return "Telefone já cadastrado. Use outro número.";
  if (code === "auth/email-already-in-use") return "Este e-mail já está cadastrado.";
  if (code === "auth/invalid-email") return "E-mail inválido.";
  if (code === "auth/weak-password") return "Senha fraca. Crie uma senha mais forte.";
  if (code === "auth/network-request-failed") return "Falha de rede. Verifique sua internet e tente novamente.";

  return "Não foi possível realizar o cadastro. Verifique os dados e tente novamente.";
}

function openSuccessModal(message) {
  const overlay = document.getElementById("successModal");
  const msgEl = document.getElementById("successModalMessage");
  const button = document.getElementById("successModalButton");
  if (!overlay || !msgEl || !button) return;

  msgEl.textContent = message || "";
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener("keydown", onKeyDown, true);

  const cleanup = () => {
    document.removeEventListener("keydown", onKeyDown, true);
    button.removeEventListener("click", onClick);
  };

  const onClick = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    cleanup();
    document.getElementById("email")?.focus();
  };

  button.addEventListener("click", onClick);
  button.focus();
}

function validateForm() {
  const email = document.getElementById("email")?.value || "";
  const senha = document.getElementById("password")?.value || "";

  const emailError = validateEmail(email);
  const passwordError = validatePassword(senha);

  setFieldError("emailError", emailError);
  setFieldError("passwordError", passwordError);

  return !emailError && !passwordError;
}

function attachLiveValidation() {
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  if (emailEl) {
    emailEl.addEventListener("input", () => {
      setFieldError("loginAuthError", "");
      setFieldError("emailError", validateEmail(emailEl.value));
    });
  }
  if (passEl) {
    passEl.addEventListener("input", () => {
      setFieldError("loginAuthError", "");
      setFieldError("passwordError", validatePassword(passEl.value));
    });
  }

  const successFromQuery = getQueryParam("success");
  const successFromStorage = (() => {
    try {
      return localStorage.getItem("successMessage") || "";
    } catch (_) {
      return "";
    }
  })();

  const message = successFromQuery || successFromStorage;
  if (message) {
    setFieldSuccess("successMessage", "");
    openSuccessModal(message);
    try {
      localStorage.removeItem("successMessage");
    } catch (_) { }
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    } catch (_) { }
  }
}

function validateRegisterForm() {
  const fullName = document.getElementById("fullName")?.value || "";
  const birthDate = document.getElementById("birthDate")?.value || "";
  const city = document.getElementById("city")?.value || "";
  const phone = document.getElementById("phone")?.value || "";
  const email = document.getElementById("registerEmail")?.value || "";
  const church = document.getElementById("church")?.value || "";
  const role = document.getElementById("role")?.value || "";
  const ministryYears = document.getElementById("ministryYears")?.value || "";
  const password = document.getElementById("registerPassword")?.value || "";


  const fullNameError = validateFullName(fullName);
  const birthDateError = validateBirthDate(birthDate);
  const cityError = validateCity(city);
  const phoneError = validatePhone(phone);
  const emailError = validateEmail(email);
  const churchError = validateChurch(church);
  const roleError = validateRole(role);
  const ministryYearsError = validateMinistryYears(ministryYears);
  const passwordError = validatePassword(password);

  setFieldError("fullNameError", fullNameError);
  setFieldError("birthDateError", birthDateError);
  setFieldError("cityError", cityError);
  setFieldError("phoneError", phoneError);
  setFieldError("registerEmailError", emailError);
  setFieldError("churchError", churchError);
  setFieldError("roleError", roleError);
  setFieldError("ministryYearsError", ministryYearsError);
  setFieldError("registerPasswordError", passwordError);
  setFieldError("registerSubmitError", "");

  return !fullNameError && !birthDateError && !cityError && !phoneError && !emailError && !churchError && !roleError && !ministryYearsError && !passwordError;
}

function updateRegisterSubmitState() {
  const btn = document.getElementById("registerSubmitButton");
  if (!btn) return;

  const fullName = document.getElementById("fullName")?.value || "";
  const birthDate = document.getElementById("birthDate")?.value || "";
  const city = document.getElementById("city")?.value || "";
  const phone = document.getElementById("phone")?.value || "";
  const email = document.getElementById("registerEmail")?.value || "";
  const church = document.getElementById("church")?.value || "";
  const role = document.getElementById("role")?.value || "";
  const ministryYears = document.getElementById("ministryYears")?.value || "";
  const password = document.getElementById("registerPassword")?.value || "";

  const isValid =
    !validateFullName(fullName) &&
    !validateBirthDate(birthDate) &&
    !validateCity(city) &&
    !validatePhone(phone) &&
    !validateEmail(email) &&
    !validateChurch(church) &&
    !validateRole(role) &&
    !validateMinistryYears(ministryYears) &&
    !validatePassword(password);

  btn.disabled = !isValid;
}

function attachRegisterLiveValidation() {
  const fullNameEl = document.getElementById("fullName");
  const birthDateEl = document.getElementById("birthDate");
  const cityEl = document.getElementById("city");
  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("registerEmail");
  const churchEl = document.getElementById("church");
  const roleEl = document.getElementById("role");
  const ministryYearsEl = document.getElementById("ministryYears");
  const passEl = document.getElementById("registerPassword");

  setFieldError("churchError", "");
  setFieldError("cityError", "");
  setFieldError("roleError", "");

  if (fullNameEl) {
    fullNameEl.addEventListener("input", () => {
      const next = sanitizeFullNameInput(fullNameEl.value);
      if (next !== fullNameEl.value) {
        const caret = fullNameEl.selectionStart ?? next.length;
        fullNameEl.value = next;
        try {
          fullNameEl.setSelectionRange(Math.min(caret, next.length), Math.min(caret, next.length));
        } catch (_) { }
      }
      setFieldError("fullNameError", validateFullName(fullNameEl.value));
      updateRegisterSubmitState();
    });
  }

  if (birthDateEl) {
    birthDateEl.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;
      const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
      if (allowed.includes(e.key)) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    });

    birthDateEl.addEventListener("input", () => {
      applyBirthDateMask(birthDateEl);
      setFieldError("birthDateError", validateBirthDate(birthDateEl.value));
      updateRegisterSubmitState();
    });

    birthDateEl.addEventListener("blur", () => {
      setFieldError("birthDateError", validateBirthDate(birthDateEl.value));
      updateRegisterSubmitState();
    });
  }

  if (cityEl) {
    cityEl.addEventListener("change", () => {
      setFieldError("cityError", validateCity(cityEl.value));
      updateRegisterSubmitState();
    });
  }

  if (ministryYearsEl) {
    ministryYearsEl.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;
      const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
      if (allowed.includes(e.key)) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    });

    ministryYearsEl.addEventListener("input", () => {
      let next = (ministryYearsEl.value || "").replace(/\D/g, "").slice(0, 2);
      if (next) {
        const n = Number.parseInt(next, 10);
        if (Number.isFinite(n) && n > 99) next = "99";
      }
      ministryYearsEl.value = next;
      setFieldError("ministryYearsError", validateMinistryYears(ministryYearsEl.value));
      updateRegisterSubmitState();
    });

    ministryYearsEl.addEventListener("blur", () => {
      setFieldError("ministryYearsError", validateMinistryYears(ministryYearsEl.value));
      updateRegisterSubmitState();
    });
  }

  if (phoneEl) {
    phoneEl.addEventListener("keydown", (e) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;

      const value = phoneEl.value || "";
      const start = phoneEl.selectionStart ?? 0;
      const end = phoneEl.selectionEnd ?? 0;
      if (start !== end) return;

      if (e.key === "Backspace") {
        const prev = value[start - 1] || "";
        if (start > 0 && prev && !/\d/.test(prev)) {
          e.preventDefault();
          const digitsLeft = (value.slice(0, start).match(/\d/g) || []).length;
          const digits = value.replace(/\D/g, "");
          const removeAt = Math.max(0, digitsLeft - 1);
          const nextDigits = digits.slice(0, removeAt) + digits.slice(removeAt + 1);
          phoneEl.value = formatPhoneDigits(nextDigits);
          applyPhoneMask(phoneEl);
          setFieldError("phoneError", validatePhone(phoneEl.value));
        }
        return;
      }

      if (e.key === "Delete") {
        const cur = value[start] || "";
        if (cur && !/\d/.test(cur)) {
          e.preventDefault();
          const digitsLeft = (value.slice(0, start).match(/\d/g) || []).length;
          const digits = value.replace(/\D/g, "");
          const removeAt = Math.max(0, digitsLeft);
          const nextDigits = digits.slice(0, removeAt) + digits.slice(removeAt + 1);
          phoneEl.value = formatPhoneDigits(nextDigits);
          applyPhoneMask(phoneEl);
          setFieldError("phoneError", validatePhone(phoneEl.value));
        }
      }
    });

    phoneEl.addEventListener("input", () => {
      applyPhoneMask(phoneEl);
      setFieldError("phoneError", validatePhone(phoneEl.value));
      updateRegisterSubmitState();
    });
  }

  if (emailEl) {
    emailEl.addEventListener("input", () => {
      setFieldError("registerEmailError", validateEmail(emailEl.value));
      updateRegisterSubmitState();
    });
  }

  if (churchEl) {
    churchEl.addEventListener("change", () => {
      setFieldError("churchError", validateChurch(churchEl.value));
      updateRegisterSubmitState();
    });
  }

  if (roleEl) {
    roleEl.addEventListener("change", () => {
      setFieldError("roleError", validateRole(roleEl.value));
      updateRegisterSubmitState();
    });
  }

  if (passEl) {
    passEl.addEventListener("input", () => {
      setFieldError("registerPasswordError", validatePassword(passEl.value));
      updateRegisterSubmitState();
    });
  }

  updateRegisterSubmitState();
}

function initChurchPicker() {
  const hidden = document.getElementById("church");
  const button = document.getElementById("churchPickerButton");
  const label = document.getElementById("churchPickerLabel");
  const overlay = document.getElementById("churchPickerOverlay");
  const panel = overlay?.querySelector(".church-picker__panel");
  if (!hidden || !button || !label || !overlay || !panel) return;

  const isRegisterPage = !!document.getElementById("registerSubmitButton");

  const open = () => {
    lockPageScroll();

    if (isRegisterPage && overlay.parentElement !== document.body) {
      overlay.__originalParent = overlay.parentElement;
      overlay.__originalNextSibling = overlay.nextSibling;
      document.body.appendChild(overlay);
    }

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");

    const selected = panel.querySelector(`[data-value="${CSS.escape(hidden.value || "")}"]`);
    (selected || panel.querySelector(".church-picker__option"))?.focus();
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");
    unlockPageScroll();
    button.focus();

    if (isRegisterPage && overlay.__originalParent) {
      const parent = overlay.__originalParent;
      const next = overlay.__originalNextSibling;
      overlay.__originalParent = null;
      overlay.__originalNextSibling = null;
      try {
        if (next && next.parentNode === parent) parent.insertBefore(overlay, next);
        else parent.appendChild(overlay);
      } catch (_) { }
    }
  };

  button.addEventListener("click", () => {
    if (overlay.classList.contains("is-open")) close();
    else open();
  });

  if (!isRegisterPage) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
  }

  overlay.addEventListener("touchmove", (e) => {
    if (e.target === overlay) e.preventDefault();
  }, { passive: false });

  overlay.addEventListener("wheel", (e) => {
    if (e.target === overlay) e.preventDefault();
  }, { passive: false });

  panel.querySelectorAll(".church-picker__option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const value = opt.getAttribute("data-value") || "";
      hidden.value = value;
      label.textContent = value || "Selecione sua igreja";
      hidden.dispatchEvent(new Event("change"));
      close();
    });
  });

  if (!isRegisterPage) {
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });
  }
}

function initSimplePicker(hiddenId, buttonId, labelId, overlayId, emptyLabel) {
  const hidden = document.getElementById(hiddenId);
  const button = document.getElementById(buttonId);
  const label = document.getElementById(labelId);
  const overlay = document.getElementById(overlayId);
  const panel = overlay?.querySelector(".church-picker__panel");
  if (!hidden || !button || !label || !overlay || !panel) return;

  const isRegisterPage = !!document.getElementById("registerSubmitButton");

  const open = () => {
    lockPageScroll();

    if (isRegisterPage && overlay.parentElement !== document.body) {
      overlay.__originalParent = overlay.parentElement;
      overlay.__originalNextSibling = overlay.nextSibling;
      document.body.appendChild(overlay);
    }

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");

    const currentValue = hidden.value || "";
    const options = Array.from(panel.querySelectorAll(".church-picker__option"));
    const selected = options.find((opt) => (opt.getAttribute("data-value") || "") === currentValue) || null;
    (selected || options[0] || null)?.focus();
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");
    unlockPageScroll();
    button.focus();

    if (isRegisterPage && overlay.__originalParent) {
      const parent = overlay.__originalParent;
      const next = overlay.__originalNextSibling;
      overlay.__originalParent = null;
      overlay.__originalNextSibling = null;
      try {
        if (next && next.parentNode === parent) parent.insertBefore(overlay, next);
        else parent.appendChild(overlay);
      } catch (_) { }
    }
  };

  button.addEventListener("click", () => {
    if (overlay.classList.contains("is-open")) close();
    else open();
  });

  if (!isRegisterPage) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
  }

  overlay.addEventListener("touchmove", (e) => {
    if (e.target === overlay) e.preventDefault();
  }, { passive: false });

  overlay.addEventListener("wheel", (e) => {
    if (e.target === overlay) e.preventDefault();
  }, { passive: false });

  panel.querySelectorAll(".church-picker__option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const value = opt.getAttribute("data-value") || "";
      hidden.value = value;
      label.textContent = value || emptyLabel;
      hidden.dispatchEvent(new Event("change"));
      close();
    });
  });

  if (!isRegisterPage) {
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });
  }
}

function showRegisterLoading() {
  const el = document.getElementById("registerLoading");
  if (!el) return;
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
}

function hideRegisterLoading() {
  const el = document.getElementById("registerLoading");
  if (!el) return;
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
}

function createProfile() {
  if (!validateRegisterForm()) return;

  const minVisibleMs = 3000;
  const startedAt = Date.now();
  showRegisterLoading();

  const fullName = document.getElementById("fullName").value.trim();
  const birthDate = document.getElementById("birthDate").value.trim();
  const city = document.getElementById("city").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const church = document.getElementById("church").value.trim();
  const role = document.getElementById("role").value.trim();
  const ministryYearsRaw = document.getElementById("ministryYears").value.trim();
  const password = document.getElementById("registerPassword").value;

  const ministryYears = Number.parseInt(ministryYearsRaw, 10);

  const finishAfterMin = () => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minVisibleMs - elapsed);
    return new Promise((resolve) => setTimeout(resolve, remaining));
  };

  ensurePhoneNotInUse(phone)
    .then(() => firebase.auth().createUserWithEmailAndPassword(email, password))
    .then((cred) => {
      if (!cred?.user) throw new Error("Falha ao criar usuário.");

      return ensurePhoneNotInUse(phone)
        .then(() => {
          const docId = toProfileDocId(fullName, cred.user.uid);
          return firebase.firestore().collection("profiles").doc(docId).set({
            uid: cred.user.uid,
            fullName,
            birthDate,
            city,
            phone,
            email,
            church,
            role,
            ministryYears,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => cred.user)
        .catch((err) => {
          if (err?.code === "phone-already-in-use") {
            return cred.user.delete().then(() => { throw err; });
          }
          throw err;
        });
    })
    .then(() => firebase.auth().signOut())
    .then(() => finishAfterMin())
    .then(() => {
      const message = `Seja bem-vindo, ${fullName}. Sua conta está pronta.`;
      try {
        localStorage.setItem("successMessage", message);
      } catch (_) { }
      window.location.href = `index.html?success=${encodeURIComponent(message)}`;
    })
    .catch((err) => {
      return finishAfterMin()
        .then(() => {
          hideRegisterLoading();
          setFieldError("registerSubmitError", getRegisterErrorMessage(err));
        });
    });
}

function toProfileDocId(fullName, uid) {
  const safeName = String(fullName || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\//g, "-");
  const safeUid = String(uid || "").trim().replace(/\//g, "-");
  return `${safeName}__${safeUid}`;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachRegisterLiveValidation);
} else {
  attachRegisterLiveValidation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChurchPicker);
} else {
  initChurchPicker();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSimplePicker("city", "cityPickerButton", "cityPickerLabel", "cityPickerOverlay", "Selecione sua cidade");
  });
} else {
  initSimplePicker("city", "cityPickerButton", "cityPickerLabel", "cityPickerOverlay", "Selecione sua cidade");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSimplePicker("role", "rolePickerButton", "rolePickerLabel", "rolePickerOverlay", "Selecione seu cargo");
  });
} else {
  initSimplePicker("role", "rolePickerButton", "rolePickerLabel", "rolePickerOverlay", "Selecione seu cargo");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachLiveValidation);
} else {
  attachLiveValidation();
}

function login() {
  setFieldError("loginAuthError", "");
  if (!validateForm()) return;

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value;

  setFieldError("emailError", "");
  setFieldError("passwordError", "");

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch((err) => {
      const code = err?.code || "";

      let msg = "Ops! Não conseguimos entrar com esses dados. Confirme seu e-mail e senha e tente novamente.";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        msg = "Ops! Não conseguimos entrar com esses dados. Confirme seu e-mail e senha e tente novamente.";
      } else if (code === "auth/invalid-email") {
        msg = "E-mail inválido.";
      } else if (code === "auth/too-many-requests") {
        msg = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      } else if (code === "auth/network-request-failed") {
        msg = "Falha de rede. Verifique sua internet e tente novamente.";
      } else if (code === "auth/unauthorized-domain") {
        msg = "Domínio não autorizado no Firebase. Informe o administrador para liberar este domínio no Authentication.";
      }

      setFieldError("loginAuthError", msg);
      document.getElementById("password")?.focus();
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}
