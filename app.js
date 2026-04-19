// CONFIG DO FIREBASE (SUBSTITUA PELO SEU)
const firebaseConfig = {
  apiKey: "AIzaSyCJsY6RdplE7vbBrK09tsrgjHTpWZZaFDM",
  authDomain: "mentoria-b510d.firebaseapp.com",
  projectId: "mentoria-b510d",
  storageBucket: "mentoria-b510d.firebasestorage.app",
  messagingSenderId: "915208966066",
  appId: "1:915208966066:web:dd7ff331e32c3573e39eab",
  measurementId: "G-HW45SZ0ZSV"
};

firebase.initializeApp(firebaseConfig);

try {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => { });
} catch (_) { }

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

function validateEmail(email) {
  const value = (email || "").trim();
  if (!value) {
    return "O e-mail é obrigatório.";
  }
  if (!value.includes("@")) {
    return "O e-mail precisa ter @.";
  }
  if (!value.toLowerCase().includes(".com")) {
    return "O e-mail precisa ter .com.";
  }
  return "";
}

function validatePassword(password) {
  const value = password || "";
  if (!value) {
    return "A senha é obrigatória.";
  }

  const digits = (value.match(/[0-9]/g) || []).length;
  const letters = (value.match(/[A-Za-z]/g) || []).length;
  const specials = (value.match(/[^A-Za-z0-9]/g) || []).length;

  if (digits < 3 || letters < 3 || specials < 1) {
    return "A senha deve ter no mínimo 3 números, 1 caracter especial e 3 letras.";
  }
  return "";
}

function validateFullName(fullName) {
  const value = (fullName || "").trim();
  if (!value) return "O nome e sobrenome é obrigatório.";

  const allowed = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
  if (!allowed.test(value)) return "Informe nome e sobrenome.";

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "O nome e sobrenome é obrigatório.";

  return "";
}

function sanitizeFullNameInput(value) {
  const v = String(value || "");
  const onlyLettersAndSpaces = v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
  return onlyLettersAndSpaces.replace(/\s{2,}/g, " ").trimStart();
}

function validateChurch(church) {
  const c = (church || "").trim();
  if (!c) return "Selecione sua igreja.";
  return "";
}

function validatePhone(phone) {
  const value = (phone || "").trim();
  if (!value) return "O telefone é obrigatório.";

  const re = /^\(\d{2}\)\s?9\s?\d{4}-\d{4}$/;
  if (!re.test(value)) return "Telefone inválido. Use o formato (11) 9 1234-1234.";

  return "";
}

function formatPhone(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);
  return formatPhoneDigits(digits);
}

function formatPhoneDigits(digits) {
  const d = (digits || "").replace(/\D/g, "").slice(0, 11);
  const ddd = d.slice(0, 2);
  const first = d.slice(2, 3);
  const part1 = d.slice(3, 7);
  const part2 = d.slice(7, 11);

  if (!d) return "";

  let out = "";
  if (ddd) out += `(${ddd}`;
  if (d.length >= 3) out += ")";
  if (first) out += ` ${first}`;
  if (part1) out += ` ${part1}`;
  if (part2) out += `-${part2}`;
  return out;
}

function applyPhoneMask(inputEl) {
  const raw = inputEl.value || "";
  const caret = inputEl.selectionStart ?? raw.length;

  const digitsLeft = (raw.slice(0, caret).match(/\d/g) || []).length;
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const formatted = formatPhoneDigits(digits);

  inputEl.value = formatted;

  if (!formatted) return;

  let count = 0;
  let newCaret = formatted.length;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) count += 1;
    if (count >= digitsLeft) {
      newCaret = i + 1;
      break;
    }
  }

  try {
    inputEl.setSelectionRange(newCaret, newCaret);
  } catch (_) { }
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

function validateBirthDate(value) {
  const v = (value || "").trim();
  if (!v) return "Informe sua data de nascimento.";
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return "Data inválida. Use dd/mm/aaaa.";

  const [ddS, mmS, yyyyS] = v.split("/");
  const dd = Number(ddS);
  const mm = Number(mmS);
  const yyyy = Number(yyyyS);

  if (!dd || !mm || !yyyy) return "Data inválida.";
  if (mm < 1 || mm > 12) return "Data inválida.";
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return "Data inválida.";

  const maxDay = new Date(yyyy, mm, 0).getDate();
  if (dd < 1 || dd > maxDay) return "Data inválida.";

  const birth = new Date(yyyy, mm - 1, dd);
  if (
    birth.getFullYear() !== yyyy ||
    birth.getMonth() !== mm - 1 ||
    birth.getDate() !== dd
  ) {
    return "Data inválida.";
  }

  const today = new Date();
  let age = today.getFullYear() - yyyy;
  const monthDiff = today.getMonth() - (mm - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dd)) {
    age -= 1;
  }

  if (age < 15) return "Idade não permitida!";
  return "";
}

function validateCity(value) {
  const v = (value || "").trim();
  if (!v) return "Selecione sua cidade.";
  return "";
}

function validateRole(value) {
  const v = (value || "").trim();
  if (!v) return "Selecione seu cargo.";
  return "";
}

function validateMinistryYears(value) {
  const v = (value || "").trim();
  if (!v) return "Informe os anos no ministério.";
  if (!/^\d{1,2}$/.test(v)) return "Informe apenas 2 números.";
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0 || n > 99) return "Informe um número entre 0 e 99.";
  return "";
}

function formatBirthDateDigits(digits) {
  const d = (digits || "").replace(/\D/g, "").slice(0, 8);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 4);
  const p3 = d.slice(4, 8);
  if (d.length <= 2) return p1;
  if (d.length <= 4) return `${p1}/${p2}`;
  return `${p1}/${p2}/${p3}`;
}

function applyBirthDateMask(inputEl) {
  if (!inputEl) return;
  const digits = (inputEl.value || "").replace(/\D/g, "");
  const next = formatBirthDateDigits(digits);
  inputEl.value = next;
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

function fileToAvatarDataUrl(file, sizePx = 256, quality = 0.82) {
  if (!file) return Promise.reject(new Error("Arquivo inválido."));

  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      let objectUrl = "";
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 1;
          const h = img.naturalHeight || img.height || 1;

          const scale = Math.min(sizePx / w, sizePx / h, 1);
          const targetW = Math.max(1, Math.round(w * scale));
          const targetH = Math.max(1, Math.round(h * scale));

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas indisponível");

          ctx.drawImage(img, 0, 0, targetW, targetH);
          const out = canvas.toDataURL("image/jpeg", quality);
          resolve(out);
        } catch (e) {
          reject(e);
        } finally {
          if (objectUrl) {
            try { URL.revokeObjectURL(objectUrl); } catch (_) { }
            objectUrl = "";
          }
        }
      };
      img.onerror = () => {
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch (_) { }
          objectUrl = "";
        }
        reject(new Error("Não foi possível ler a imagem."));
      };

      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } catch (e) {
      reject(e);
    }
  });
}

function renderProfile(profile) {
  const container = document.getElementById("profileContainer");
  if (!container) return;
  const isEditing = window.__profileIsEditing === true;
  const draft = (window.__profileDraft && typeof window.__profileDraft === "object") ? window.__profileDraft : null;

  const setInvalid = (inputEl, invalid) => {
    if (!inputEl) return;
    if (invalid) inputEl.classList.add("is-invalid");
    else inputEl.classList.remove("is-invalid");
  };

  const escAttr = (v) => String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const fullName = profile?.fullName || "";
  const birthDate = profile?.birthDate || "";

  const city = profile?.city || "";
  const phone = profile?.phone || "";
  const email = profile?.email || "";
  const church = profile?.church || "";
  const role = profile?.role || "";
  const ministryYears = profile?.ministryYears;
  const photoURL = profile?.photoURL || "";
  const photoDataUrl = profile?.photoDataUrl || "";

  const editFullName = isEditing ? (draft?.fullName ?? fullName) : fullName;
  const editBirthDate = isEditing ? (draft?.birthDate ?? birthDate) : birthDate;
  const editCity = isEditing ? (draft?.city ?? city) : city;
  const editPhone = isEditing ? (draft?.phone ?? phone) : phone;
  const editChurch = isEditing ? (draft?.church ?? church) : church;
  const editRole = isEditing ? (draft?.role ?? role) : role;
  const editMinistryYears = isEditing ? (draft?.ministryYears ?? ministryYears) : ministryYears;

  const cityOptions = [
    "Barueri",
    "Carapicuíba",
    "Cotia",
    "Diadema",
    "Embu das Artes",
    "Guarulhos",
    "Itapevi",
    "Jandira",
    "Mauá",
    "Osasco",
    "Santana de Parnaíba",
    "Santo André",
    "São Bernardo do Campo",
    "São Caetano do Sul",
    "São Paulo",
    "Taboão da Serra"
  ];

  const churchOptions = [
    "Ad Brás Osasco 1 de Maio",
    "Ad Brás Osasco Açucara",
    "Ad Brás Osasco Bandeiras",
    "Ad Brás Osasco Bonança",
    "Ad Brás Osasco Conceição",
    "Ad Brás Osasco Conj. Metalúrgicos",
    "Ad Brás Osasco Corrego Rico",
    "Ad Brás Osasco Flamenguinho",
    "Ad Brás Osasco Flor da Primavera",
    "Ad Brás Osasco Guanabara",
    "Ad Brás Osasco Helena Maria I",
    "Ad Brás Osasco Helena Maria II",
    "Ad Brás Osasco Jandaia",
    "Ad Brás Osasco Jd D'Abril SP",
    "Ad Brás Osasco Jd D'Abril Osasco",
    "Ad Brás Osasco Joelma",
    "Ad Brás Osasco Jussara",
    "Ad Brás Osasco Munhoz Junior",
    "Ad Brás Osasco Mutinga I",
    "Ad Brás Osasco Mutinga II",
    "Ad Brás Osasco Mutinga Ômega",
    "Ad Brás Osasco Novo Horizonte",
    "Ad Brás Osasco Novo Osasco",
    "Ad Brás Osasco Padroeira II",
    "Ad Brás Osasco Parque Imperial I",
    "Ad Brás Osasco Parque Imperial II",
    "Ad Brás Osasco Piratininga",
    "Ad Brás Osasco Portela",
    "Ad Brás Osasco Presidente Altino",
    "Ad Brás Osasco Quitaúna",
    "Ad Brás Osasco Recanto das Rosas 1",
    "Ad Brás Osasco Samambaia",
    "Ad Brás Osasco Santa Maria",
    "Ad Brás Osasco Santo Antonio",
    "Ad Brás Osasco Sede",
    "Ad Brás Osasco São João da Bela Vista",
    "Ad Brás Osasco São Vitor",
    "Ad Brás Osasco Teresa",
    "Ad Brás Osasco Três Montanhas",
    "Ad Brás Osasco Vila Dirce",
    "Ad Brás Osasco Vila dos Andrades",
    "Ad Brás Osasco Vila Menck",
    "Ad Brás Osasco Vila Simões",
    "Ad Brás Osasco Ypê"
  ];

  const roleOptions = [
    "Pastor",
    "Evangelista",
    "Presbítero",
    "Díacono",
    "Cooperador",
    "Aux. Interno"
  ];

  const renderOptions = (options, selectedValue, placeholder) => {
    const selected = String(selectedValue ?? "");
    const ph = placeholder ? `<option value="">${placeholder}</option>` : `<option value=""></option>`;
    return ph + options.map((opt) => {
      const v = String(opt);
      const isSelected = v === selected;
      return `<option value="${escAttr(v)}"${isSelected ? " selected" : ""}>${v}</option>`;
    }).join("");
  };

  const renderPickerButtons = (options) => {
    return options.map((opt) => {
      const v = String(opt);
      return `<button class="church-picker__option" type="button" data-value="${escAttr(v)}">${v}</button>`;
    }).join("");
  };

  const initials = (fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] || "").toUpperCase())
    .join("") || "BJ";

  container.innerHTML = `
    <div class="home-profile__block home-profile__photo">
      <div class="home-profile__avatar">
        ${(photoDataUrl || photoURL)
      ? `<img class="home-profile__avatar-img" src="${photoDataUrl || photoURL}" alt="Foto do perfil" />`
      : `<div class="home-profile__avatar-fallback" aria-hidden="true">${initials}</div>`}
      </div>
      <div class="home-profile__header">
        <div class="home-profile__header-title">${isEditing ? `<input class="home-profile__input" id="profileEditFullName" type="text" value="${escAttr(editFullName)}" />` : (fullName || "-")}</div>
        <div class="home-profile__photo-actions">
          <input id="profilePhotoCamera" type="file" accept="image/*" capture="environment" style="display:none" />
          <input id="profilePhotoGallery" type="file" accept="image/*" style="display:none" />
          <button class="home-profile__photo-btn" id="profilePhotoCameraBtn" type="button">Tirar foto</button>
          <button class="home-profile__photo-btn" id="profilePhotoGalleryBtn" type="button">Escolher foto</button>
        </div>
      </div>
    </div>

    <div class="home-profile__block home-profile__section">
      <div class="home-profile__section-title">Dados pessoais</div>
      <div class="home-profile__row"><span class="home-profile__label">Data de nascimento</span><span class="home-profile__value">${isEditing ? `<input class="home-profile__input" id="profileEditBirthDate" type="text" value="${escAttr(editBirthDate)}" />` : (birthDate || "-")}</span></div>
      <div class="home-profile__row"><span class="home-profile__label">Cidade</span><span class="home-profile__value">${isEditing ? `
        <input type="hidden" id="profileEditCity" value="${escAttr(editCity)}" autocomplete="address-level2" />
        <button class="home-profile__input church-picker" id="profileCityPickerButton" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span id="profileCityPickerLabel">${editCity ? escAttr(editCity) : "Selecione sua cidade"}</span>
          <span class="church-picker__chevron" aria-hidden="true"></span>
        </button>
        <div class="church-picker__overlay" id="profileCityPickerOverlay" aria-hidden="true">
          <div class="church-picker__panel" role="listbox" aria-label="Selecione sua cidade" style="max-height: calc((4 * var(--picker-option-height, 44px)) + 20px);">
            ${renderPickerButtons(cityOptions)}
          </div>
        </div>
      ` : (city || "-")}</span></div>
      <div class="home-profile__row"><span class="home-profile__label">Telefone</span><span class="home-profile__value">${isEditing ? `<input class="home-profile__input" id="profileEditPhone" type="text" value="${escAttr(editPhone)}" />` : (phone || "-")}</span></div>
      <div class="home-profile__row"><span class="home-profile__label">E-mail</span><span class="home-profile__value">${email || "-"}</span></div>
    </div>

    <div class="home-profile__block home-profile__section">
      <div class="home-profile__section-title">Dados ministeriais</div>
      <div class="home-profile__row"><span class="home-profile__label">Igreja</span><span class="home-profile__value">${isEditing ? `
        <input type="hidden" id="profileEditChurch" value="${escAttr(editChurch)}" autocomplete="organization" />
        <button class="home-profile__input church-picker" id="profileChurchPickerButton" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span id="profileChurchPickerLabel">${editChurch ? escAttr(editChurch) : "Selecione sua igreja"}</span>
          <span class="church-picker__chevron" aria-hidden="true"></span>
        </button>
        <div class="church-picker__overlay" id="profileChurchPickerOverlay" aria-hidden="true">
          <div class="church-picker__panel" role="listbox" aria-label="Selecione sua igreja" style="max-height: calc((4 * var(--picker-option-height, 44px)) + 20px);">
            ${renderPickerButtons(churchOptions)}
          </div>
        </div>
      ` : (church || "-")}</span></div>
      <div class="home-profile__row"><span class="home-profile__label">Cargo</span><span class="home-profile__value">${isEditing ? `
        <input type="hidden" id="profileEditRole" value="${escAttr(editRole)}" autocomplete="organization-title" />
        <button class="home-profile__input church-picker" id="profileRolePickerButton" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span id="profileRolePickerLabel">${editRole ? escAttr(editRole) : "Selecione seu cargo"}</span>
          <span class="church-picker__chevron" aria-hidden="true"></span>
        </button>
        <div class="church-picker__overlay" id="profileRolePickerOverlay" aria-hidden="true">
          <div class="church-picker__panel" role="listbox" aria-label="Selecione seu cargo" style="max-height: calc((4 * var(--picker-option-height, 44px)) + 20px);">
            ${renderPickerButtons(roleOptions)}
          </div>
        </div>
      ` : (role || "-")}</span></div>
      <div class="home-profile__row"><span class="home-profile__label">Anos no Ministério</span><span class="home-profile__value">${isEditing ? `<input class="home-profile__input" id="profileEditMinistryYears" type="text" inputmode="numeric" autocomplete="off" maxlength="2" pattern="^\\d{1,2}$" value="${escAttr((editMinistryYears === 0 || (typeof editMinistryYears === "number" && Number.isFinite(editMinistryYears))) ? String(editMinistryYears) : (editMinistryYears ? String(editMinistryYears) : ""))}" />` : ((ministryYears === 0 || (typeof ministryYears === "number" && Number.isFinite(ministryYears))) ? `${ministryYears} Anos` : (ministryYears ? `${ministryYears} Anos` : "-"))}</span></div>
    </div>

    <div class="home-profile__actions">
      ${isEditing
      ? `<button class="home-profile__photo-btn" id="profileSaveBtn" type="button">Salvar</button>
           <button class="home-profile__photo-btn" id="profileCancelBtn" type="button">Cancelar</button>`
      : `<button class="home-profile__photo-btn" id="profileEditBtn" type="button">Editar</button>`}
    </div>

    <div class="home-profile__block home-profile__logout">
      <button class="home-logout" type="button" onclick="logout()">Sair</button>
    </div>
  `;

  const cameraInput = document.getElementById("profilePhotoCamera");
  const galleryInput = document.getElementById("profilePhotoGallery");
  const cameraBtn = document.getElementById("profilePhotoCameraBtn");
  const galleryBtn = document.getElementById("profilePhotoGalleryBtn");
  const errorEl = document.getElementById("profileError");

  const editBtn = document.getElementById("profileEditBtn");
  const saveBtn = document.getElementById("profileSaveBtn");
  const cancelBtn = document.getElementById("profileCancelBtn");

  const avatarEl = container.querySelector(".home-profile__avatar");

  const setBusy = (busy) => {
    if (cameraBtn) cameraBtn.disabled = !!busy;
    if (galleryBtn) galleryBtn.disabled = !!busy;
    if (editBtn) editBtn.disabled = !!busy;
    if (saveBtn) saveBtn.disabled = !!busy;
    if (cancelBtn) cancelBtn.disabled = !!busy;
  };

  const startEdit = () => {
    window.__profileIsEditing = true;
    window.__profileDraft = {
      fullName: (fullName || "").trim(),
      birthDate: (birthDate || "").trim(),
      city: (city || "").trim(),
      phone: (phone || "").trim(),
      church: (church || "").trim(),
      role: (role || "").trim(),
      ministryYears: (ministryYears === 0 || (typeof ministryYears === "number" && Number.isFinite(ministryYears))) ? ministryYears : (ministryYears || "")
    };
    renderProfile(profile);
  };

  const cancelEdit = () => {
    window.__profileIsEditing = false;
    window.__profileDraft = null;
    if (errorEl) errorEl.textContent = "";
    renderProfile(profile);
  };

  const saveEdit = () => {
    const user = firebase.auth().currentUser;
    if (!user?.uid) {
      if (errorEl) errorEl.textContent = "Usuário não autenticado.";
      return;
    }

    const fullNameEl = document.getElementById("profileEditFullName");
    const birthDateEl = document.getElementById("profileEditBirthDate");
    const cityEl = document.getElementById("profileEditCity");
    const cityBtnEl = document.getElementById("profileCityPickerButton");
    const phoneEl = document.getElementById("profileEditPhone");
    const churchEl = document.getElementById("profileEditChurch");
    const churchBtnEl = document.getElementById("profileChurchPickerButton");
    const roleEl = document.getElementById("profileEditRole");
    const roleBtnEl = document.getElementById("profileRolePickerButton");
    const ministryYearsEl = document.getElementById("profileEditMinistryYears");

    const nextFullName = (fullNameEl?.value || "").trim();
    const nextBirthDate = (birthDateEl?.value || "").trim();
    const nextCity = (cityEl?.value || "").trim();
    const nextPhone = (phoneEl?.value || "").trim();
    const nextChurch = (churchEl?.value || "").trim();
    const nextRole = (roleEl?.value || "").trim();

    const rawYears = (ministryYearsEl?.value || "").trim();
    const yearsDigits = rawYears.replace(/\D/g, "").slice(0, 2);
    const nextYears = yearsDigits === "" ? null : Math.min(99, Math.max(0, Number.parseInt(yearsDigits, 10)));

    const invalidMap = {
      fullName: !nextFullName,
      birthDate: !nextBirthDate,
      city: !nextCity,
      phone: !nextPhone,
      church: !nextChurch,
      role: !nextRole,
      ministryYears: nextYears === null
    };

    setInvalid(fullNameEl, invalidMap.fullName);
    setInvalid(birthDateEl, invalidMap.birthDate);
    setInvalid(cityBtnEl || cityEl, invalidMap.city);
    setInvalid(phoneEl, invalidMap.phone);
    setInvalid(churchBtnEl || churchEl, invalidMap.church);
    setInvalid(roleBtnEl || roleEl, invalidMap.role);
    setInvalid(ministryYearsEl, invalidMap.ministryYears);

    const hasAnyInvalid = Object.values(invalidMap).some(Boolean);
    if (hasAnyInvalid) {
      if (errorEl) errorEl.textContent = "";
      const firstInvalidEl = (
        (invalidMap.fullName && fullNameEl) ||
        (invalidMap.birthDate && birthDateEl) ||
        (invalidMap.city && (cityBtnEl || cityEl)) ||
        (invalidMap.phone && phoneEl) ||
        (invalidMap.church && (churchBtnEl || churchEl)) ||
        (invalidMap.role && (roleBtnEl || roleEl)) ||
        (invalidMap.ministryYears && ministryYearsEl) ||
        null
      );

      if (firstInvalidEl && typeof firstInvalidEl.focus === "function") firstInvalidEl.focus();
      return;
    }

    setBusy(true);
    if (errorEl) errorEl.textContent = "";

    const docId = (window.__profileDocId || "").trim() || toProfileDocId(nextFullName, user.uid);
    firebase.firestore().collection("profiles").doc(docId).set({
      uid: user.uid,
      fullName: nextFullName,
      birthDate: nextBirthDate,
      city: nextCity,
      phone: nextPhone,
      church: nextChurch,
      role: nextRole,
      ministryYears: nextYears,
      profileUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
      .then(() => {
        window.__profileIsEditing = false;
        window.__profileDraft = null;
      })
      .then(() => {
        window.__profileDocId = docId;
      })
      .catch((err) => {
        const msg = err?.message ? `: ${err.message}` : "";
        if (errorEl) errorEl.textContent = `Não foi possível salvar as alterações${msg}`;
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const savePhoto = (file) => {
    if (!file) return;
    setBusy(true);

    try {
      if (errorEl) errorEl.textContent = "";

      if (!avatarEl) {
        if (errorEl) errorEl.textContent = "Não foi possível carregar a prévia da foto.";
        return;
      }

      const user = firebase.auth().currentUser;
      if (!user?.uid) {
        if (errorEl) errorEl.textContent = "Usuário não autenticado.";
        return;
      }

      fileToAvatarDataUrl(file)
        .then((dataUrl) => {
          if (!dataUrl) throw new Error("Falha ao gerar imagem.");
          const docId = (window.__profileDocId || "").trim() || toProfileDocId(fullName, user.uid);
          return firebase.firestore().collection("profiles").doc(docId).set({
            photoDataUrl: dataUrl,
            photoUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        })
        .catch((err) => {
          const msg = err?.message ? `: ${err.message}` : "";
          if (errorEl) errorEl.textContent = `Não foi possível salvar a foto${msg}`;
        })
        .finally(() => {
          setBusy(false);
          if (cameraInput) cameraInput.value = "";
          if (galleryInput) galleryInput.value = "";
        });
      return;
    } catch (err) {
      const msg = err?.message ? `: ${err.message}` : "";
      if (errorEl) errorEl.textContent = `Não foi possível carregar a prévia da foto${msg}`;
    } finally {
      // Async finalization handled above
    }
  };

  if (cameraBtn && cameraInput) {
    cameraBtn.addEventListener("click", () => cameraInput.click());
    cameraInput.addEventListener("change", () => savePhoto(cameraInput.files?.[0]));
  }
  if (galleryBtn && galleryInput) {
    galleryBtn.addEventListener("click", () => galleryInput.click());
    galleryInput.addEventListener("change", () => savePhoto(galleryInput.files?.[0]));
  }

  if (editBtn) editBtn.addEventListener("click", startEdit);
  if (cancelBtn) cancelBtn.addEventListener("click", cancelEdit);
  if (saveBtn) saveBtn.addEventListener("click", saveEdit);

  if (isEditing) {
    const fullNameEl = document.getElementById("profileEditFullName");
    const birthDateEl = document.getElementById("profileEditBirthDate");
    const cityEl = document.getElementById("profileEditCity");
    const cityBtnEl = document.getElementById("profileCityPickerButton");
    const phoneEl = document.getElementById("profileEditPhone");
    const churchEl = document.getElementById("profileEditChurch");
    const churchBtnEl = document.getElementById("profileChurchPickerButton");
    const roleEl = document.getElementById("profileEditRole");
    const roleBtnEl = document.getElementById("profileRolePickerButton");
    const ministryYearsEl = document.getElementById("profileEditMinistryYears");

    initSimplePicker("profileEditCity", "profileCityPickerButton", "profileCityPickerLabel", "profileCityPickerOverlay", "Selecione sua cidade");
    initSimplePicker("profileEditChurch", "profileChurchPickerButton", "profileChurchPickerLabel", "profileChurchPickerOverlay", "Selecione sua igreja");
    initSimplePicker("profileEditRole", "profileRolePickerButton", "profileRolePickerLabel", "profileRolePickerOverlay", "Selecione seu cargo");

    const wireClearOnInput = (el, mirrorEl) => {
      if (!el) return;
      const handler = () => {
        const v = (el.value || "").trim();
        const targetEl = mirrorEl || el;
        if (el.type === "number") {
          setInvalid(targetEl, v === "");
          return;
        }
        setInvalid(targetEl, !v);
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    };

    wireClearOnInput(fullNameEl);
    wireClearOnInput(birthDateEl);
    wireClearOnInput(cityEl, cityBtnEl);
    wireClearOnInput(phoneEl);
    wireClearOnInput(churchEl, churchBtnEl);
    wireClearOnInput(roleEl, roleBtnEl);
    wireClearOnInput(ministryYearsEl);

    if (ministryYearsEl) {
      ministryYearsEl.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.isComposing) return;
        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
        if (allowed.includes(e.key)) return;
        if (/^\d$/.test(e.key)) return;
        e.preventDefault();
      });

      const clampYears = () => {
        let next = (ministryYearsEl.value || "").replace(/\D/g, "").slice(0, 2);
        if (next) {
          const n = Number.parseInt(next, 10);
          if (Number.isFinite(n) && n > 99) next = "99";
        }
        ministryYearsEl.value = next;
      };

      ministryYearsEl.addEventListener("input", clampYears);
      ministryYearsEl.addEventListener("blur", clampYears);
    }
  }
}

function isEmailInProfiles(email) {
  if (!firebase.firestore) return Promise.resolve(false);

  return firebase.firestore().collection("profiles")
    .where("email", "==", (email || "").trim())
    .limit(1)
    .get()
    .then((snap) => !snap.empty)
    .catch(() => false);
}

function getPdfTitleFromFilename(filename) {
  const name = (filename || "").trim();
  if (!name) return "Documento";
  return name.replace(/\.pdf$/i, "").trim() || "Documento";
}

function toCuriositySummary(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const max = 240;
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "...";
}

function renderPdfCoverToDataUrl(pdf, maxWidth) {
  if (!pdf) return Promise.resolve("");
  return pdf.getPage(1)
    .then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const targetW = Math.min(maxWidth || 92, viewport.width);
      const scale = viewport.width ? (targetW / viewport.width) : 1;
      const vp = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(vp.width));
      canvas.height = Math.max(1, Math.round(vp.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      return page.render({ canvasContext: ctx, viewport: vp }).promise
        .then(() => canvas.toDataURL("image/jpeg", 0.84));
    })
    .catch(() => "");
}

function renderLibraryItem(listEl, item) {
  if (!listEl) return null;
  const title = item?.title || "Documento";
  const summary = item?.summary || "";
  const downloadUrl = item?.downloadUrl || "";
  const downloadName = item?.downloadName || "documento.pdf";
  const tag = item?.tag || "PDF / Texto";
  const size = item?.sizeLabel || "";

  const wrapper = document.createElement("div");
  wrapper.className = "library-item is-collapsed";
  wrapper.innerHTML = `
    <div class="library-item__header">
      <div class="library-item__icon" aria-hidden="true"></div>
      <div class="library-item__title"></div>
      <button class="library-item__toggle" type="button" aria-expanded="false">Expandir</button>
    </div>

    <div class="library-item__panel" aria-hidden="true">
      <div class="library-item__summary"></div>
      <div class="library-item__footer">
        <div class="library-item__meta">
          <a class="library-item__pill library-item__pill--download" href="#" download></a>
          <span class="library-item__size"></span>
        </div>
      </div>
    </div>
  `;

  wrapper.querySelector(".library-item__title").textContent = title;
  wrapper.querySelector(".library-item__summary").textContent = summary;
  const pill = wrapper.querySelector(".library-item__pill");
  pill.textContent = tag;
  wrapper.querySelector(".library-item__size").textContent = size;

  pill.setAttribute("href", downloadUrl || "#");
  pill.setAttribute("download", downloadName);
  if (!downloadUrl) pill.setAttribute("aria-disabled", "true");

  const toggleBtn = wrapper.querySelector(".library-item__toggle");
  const panelEl = wrapper.querySelector(".library-item__panel");
  const setOpen = (open) => {
    wrapper.classList.toggle("is-collapsed", !open);

    toggleBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    toggleBtn.textContent = open ? "Fechar" : "Expandir";
    panelEl?.setAttribute("aria-hidden", open ? "false" : "true");
  };

  setOpen(false);

  toggleBtn?.addEventListener("click", () => {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  listEl.appendChild(wrapper);
  return wrapper;
}

function extractPdfTextFromArrayBuffer(arrayBuffer, maxChars) {
  if (!window.pdfjsLib) return Promise.resolve("");

  try {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  } catch (_) { }

  return window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
    .then((pdf) => {
      const total = pdf.numPages || 0;
      let out = "";

      const readPage = (n) => {
        if (n > total) return Promise.resolve(out);
        return pdf.getPage(n)
          .then((page) => page.getTextContent())
          .then((tc) => {
            const chunk = (tc.items || []).map((it) => it.str || "").join(" ");
            out += " " + chunk;
            if (maxChars && out.length >= maxChars) return out;
            return readPage(n + 1);
          });
      };

      return readPage(1);
    })
    .then((t) => (t || "").replace(/\s+/g, " ").trim());
}

function initLibrary() {
  const listEl = document.getElementById("libraryList");
  if (!listEl) return;

  const docs = [
    {
      filename: "Raízes do vitimismo.pdf",
      title: "Raízes do vitimismo",
      tag: "PDF / Texto",
      videoFilename: "Raízes do vitimismo Video.mp4",
      videoTag: "Video",
      fallbackSummary: "Uma leitura direta e necessária sobre como o vitimismo se forma, se alimenta e impacta decisões. Descubra os sinais sutis que prendem sua mente e como romper esse ciclo. Uma reflexão que muda postura e liderança."
    },
    {
      filename: "5_porques.pdf",
      title: "5 Porquês",
      tag: "PDF / Texto",
      videoFilename: "5 Porques Video.mp4",
      videoTag: "Video",
      fallbackSummary: "Um método simples, prático e profundo para sair do sintoma e chegar à raiz. Aprenda a fazer as perguntas certas na hora certa e destravar decisões com clareza. Uma ferramenta poderosa para liderança e ministério."
    }
  ];

  docs.forEach((doc) => {
    const url = encodeURI(doc.filename);
    const card = renderLibraryItem(listEl, {
      title: doc.title,
      summary: "Análise em andamento...",
      tag: doc.tag,
      downloadUrl: url,
      downloadName: doc.filename
    });

    if (card && doc.videoFilename) {
      const metaEl = card.querySelector(".library-item__meta");
      const pillEl = card.querySelector(".library-item__pill--download");

      if (metaEl && pillEl) {
        const videoPill = document.createElement("a");
        videoPill.className = "library-item__pill library-item__pill--download";
        videoPill.textContent = doc.videoTag || "Video";
        videoPill.setAttribute("href", encodeURI(doc.videoFilename));
        videoPill.setAttribute("download", doc.videoFilename);
        metaEl.insertBefore(videoPill, pillEl.nextSibling);
      }
    }

    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => extractPdfTextFromArrayBuffer(buf, 8000))
      .then((text) => {
        if (!card) return;
        if (doc.filename === "5_porques.pdf") {
          card.querySelector(".library-item__summary").textContent = doc.fallbackSummary;
          return;
        }

        const s = toCuriositySummary(text);
        card.querySelector(".library-item__summary").textContent = s || doc.fallbackSummary;
      })
      .catch(() => {
        if (!card) return;
        card.querySelector(".library-item__summary").textContent = doc.fallbackSummary;
      });
  });
}

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

function atualizarSetaTrilha() {
  const trilhaCard = document.getElementById("trilhaCard");
  const toggleBtn = document.getElementById("toggleTrilha");

  if (!trilhaCard || !toggleBtn) return;

  toggleBtn.innerText = trilhaCard.classList.contains("is-collapsed")
    ? "▼"
    : "▲";
}

function initTrilha() {
  const trilhaCard = document.getElementById("trilhaCard");
  const toggleBtn = document.getElementById("toggleTrilha");

  if (!trilhaCard || !toggleBtn) return;

  // 🔥 remove qualquer evento anterior
  const newBtn = toggleBtn.cloneNode(true);
  toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

  atualizarSetaTrilha();

  newBtn.addEventListener("click", () => {
    trilhaCard.classList.toggle("is-collapsed");
    atualizarSetaTrilha();
  });
}

function resetarTrilha() {
  const trilhaCard = document.getElementById("trilhaCard");
  if (!trilhaCard) return;

  trilhaCard.classList.add("is-collapsed");

  atualizarSetaTrilha(); // 🔥 ESSA LINHA É O QUE FALTAVA
}

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
      initTrilha();      // inicializa
      resetarTrilha();   // depois força estado correto
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
      home: {
        title: greeting,
        subtitle: "Bem-vindo à sua jornada de transformação ministerial"
      },
      trail: {
        title: "Trilha de Aprendizado",
        subtitle: "Sua jornada ministerial elevada ao nível máximo"
      },
      messages: {
        title: "Canal de Comunicação",
        subtitle: "Mensagens diretas com o mentor"
      },
      library: {
        title: "Biblioteca de Recursos",
        subtitle: "Materiais exclusivos organizados por blocos temáticos"
      },
      profile: {
        title: "Meu Perfil",
        subtitle: "Dados pessoais e histórico ministerial"
      }
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
      respostas: {
        q1,
        q2,
        q3,
        q4
      },
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

      // troca de aba normal
      const tab = btn.dataset.tab;

      document.querySelectorAll(".home-tab").forEach(t => t.classList.remove("is-active"));
      document.querySelector(`#tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)
        ?.classList.add("is-active");

      document.querySelectorAll(".home-nav__item").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // 🔥 AQUI É O PULO DO GATO
      resetTrilha();
    });
  });

  setActiveHomeTab("home");

  controlarBanner(tab);

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
                renderProfile({
                  fullName: fullName,
                  phone: "",
                  email: user.email || "",
                  church: ""
                });
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
              renderProfile({
                fullName: fullName,
                phone: "",
                email: user.email || "",
                church: ""
              });
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

if (document.getElementById("homeGreeting") || document.querySelector(".home-page")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomePage);
  } else {
    initHomePage();
  }
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// =========================
// 🔥 TRILHA (VERSÃO CORRETA)
// =========================

function atualizarSetaTrilha() {
  const trilhaCard = document.getElementById("trilhaCard");
  const toggleBtn = document.getElementById("toggleTrilha");

  if (!trilhaCard || !toggleBtn) return;

  const isCollapsed = trilhaCard.classList.contains("is-collapsed");

  toggleBtn.innerText = isCollapsed ? "▼" : "▲";
}

function initTrilhaToggle() {
  const trilhaCard = document.getElementById("trilhaCard");
  const toggleBtn = document.getElementById("toggleTrilha");

  if (!trilhaCard || !toggleBtn) return;

  // 🔥 começa fechado
  trilhaCard.classList.add("is-collapsed");

  // 🔥 garante seta correta
  atualizarSetaTrilha();

  // 🔥 remove possíveis eventos duplicados (blindagem)
  toggleBtn.replaceWith(toggleBtn.cloneNode(true));

  const newToggleBtn = document.getElementById("toggleTrilha");

  newToggleBtn.addEventListener("click", () => {
    trilhaCard.classList.toggle("is-collapsed");

    // 🔥 sempre sincroniza
    atualizarSetaTrilha();
  });
}

// 🔥 inicializa corretamente
document.addEventListener("DOMContentLoaded", initTrilhaToggle);

// PROGRESSO DA TRILHA (flags)
document.addEventListener("DOMContentLoaded", () => {
  const flags = document.querySelectorAll("#tabTrail .flag-item");
  const progresso = document.getElementById("progressoTrilha");

  function atualizarProgresso() {
    const total = flags.length;
    const marcados = document.querySelectorAll("#tabTrail .flag-item.is-checked").length;

    if (progresso) {
      progresso.innerText = `${marcados}/${total}`;
    }
  }

  // inicial
  atualizarProgresso();

  // escuta clique nas bolinhas
  flags.forEach(flag => {
    flag.addEventListener("click", () => {
      setTimeout(atualizarProgresso, 0);
    });
  });
});

// ===============================
// FLAG + PERSISTÊNCIA + PROGRESSO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const flags = document.querySelectorAll("#tabTrail .flag-item");
  const progresso = document.getElementById("progressoTrilha");

  // 🔹 carregar estado salvo
  const savedFlags = JSON.parse(localStorage.getItem("trilhaFlags") || "[]");

  flags.forEach((flag, index) => {
    if (savedFlags[index]) {
      flag.classList.add("is-checked");
    }

    flag.addEventListener("click", () => {
      flag.classList.toggle("is-checked");

      // salvar estado
      const updated = Array.from(flags).map(f =>
        f.classList.contains("is-checked")
      );

      localStorage.setItem("trilhaFlags", JSON.stringify(updated));

      atualizarProgresso();
    });
  });

  function atualizarProgresso() {
    const total = flags.length;
    const marcados = document.querySelectorAll("#tabTrail .flag-item.is-checked").length;

    if (progresso) {
      progresso.innerText = `${marcados}/${total}`;
    }
  }

  // inicial
  atualizarProgresso();
});

function resetTrilha() {
  const trilha = document.getElementById("trilhaCard");
  if (!trilha) return;

  trilha.classList.add("is-collapsed");
}













// ===============================
// 🔥 MODAL PESQUISA IETEB (LIMPO)
// ===============================

let modalJaAberto = false;

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.getElementById("researchModal");
  const modalBox = document.querySelector(".modal-box");

  // ===============================
  // ABRIR MODAL
  // ===============================
  /*document.addEventListener("click", function (e) {
    if (!modalJaAberto && !e.target.closest(".modal-box")) {
      modal.style.display = "flex";
      modalJaAberto = true;
    }
  });*/
  document.addEventListener("click", function (e) {

    // ❌ se clicou dentro do modal → ignora
    if (e.target.closest(".modal-box") || e.target.closest(".custom-select")) return;

    // 🔒 SE JÁ RESPONDEU → MOSTRA MENSAGEM FINAL
    if (localStorage.getItem("pesquisaRespondida") === "true") {
      const popup = document.getElementById("popupObrigado");

      popup.querySelector("h2").textContent =
        "Sua plataforma de estudos da IETEB logo estará disponível!";

      abrirObrigado();
      return;
    }

    // ❌ se modal já está aberto → ignora
    if (modalJaAberto) return;

    // ✅ abre modal
    modal.style.display = "flex";
    modalJaAberto = true;

  });

  // ===============================
  // NÃO FECHAR AO CLICAR DENTRO
  // ===============================
  if (modalBox) {
    modalBox.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // ===============================
  // LIMPAR ERROS AO DIGITAR
  // ===============================
  const nomeInput = document.getElementById("nomeCompleto");
  const emailInput = document.getElementById("emailPesquisa");

  if (nomeInput) {
    nomeInput.addEventListener("input", function () {
      const valor = this.value.trim();
      const erroNome = document.getElementById("erroNome");

      if (!valor) {
        erroNome.textContent = "";
      } else if (!valor.includes(" ")) {
        erroNome.textContent = "Digite nome e sobrenome.";
      } else {
        erroNome.textContent = "";
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function () {
      const valor = this.value.trim();
      const erroEmail = document.getElementById("erroEmail");

      if (!valor) {
        erroEmail.textContent = "";
      } else if (!valor.includes("@") || !valor.includes(".com")) {
        erroEmail.textContent = "Digite um email válido.";
      } else {
        erroEmail.textContent = "";
      }
    });
  }

});

// ===============================
// VALIDAR ETAPA 1
// ===============================
function validarPesquisa() {

  const nome = document.getElementById("nomeCompleto").value.trim();
  const email = document.getElementById("emailPesquisa").value.trim();

  const erroNome = document.getElementById("erroNome");
  const erroEmail = document.getElementById("erroEmail");

  let valido = true;

  erroNome.textContent = "";
  erroEmail.textContent = "";

  // 🔴 NOME
  if (!nome) {
    erroNome.textContent = "Campo obrigatório.";
    valido = false;
  } else if (!nome.includes(" ")) {
    erroNome.textContent = "Digite nome e sobrenome.";
    valido = false;
  }

  // 🔴 EMAIL
  if (!email) {
    erroEmail.textContent = "Campo obrigatório.";
    valido = false;
  } else if (!email.includes("@") || !email.includes(".com")) {
    erroEmail.textContent = "Digite um email válido.";
    valido = false;
  }

  // ✅ AVANÇA
  if (valido) {
    document.getElementById("etapaInicial").style.display = "none";
    document.getElementById("etapaPerguntas").style.display = "block";
  }
}

// ===============================
// FECHAR MODAL
// ===============================
function fecharModal() {

  const modal = document.getElementById("researchModal");
  if (modal) {
    modal.style.display = "none";
  }

  // 🔥 FORÇA LIBERAÇÃO (ESSENCIAL)
  modalJaAberto = false;

  // reset etapas
  document.getElementById("etapaInicial").style.display = "block";
  document.getElementById("etapaPerguntas").style.display = "none";

  // reset perguntas condicionais
  document.getElementById("perguntaCurso").style.display = "none";
  document.getElementById("perguntaFormato").style.display = "none";
  document.getElementById("perguntaDiasAoVivo").style.display = "none";
  document.getElementById("perguntaLocal").style.display = "none";
  document.getElementById("perguntaRegional").style.display = "none";
  document.getElementById("perguntaDiasPresencial").style.display = "none";

  // limpar campos
  document.getElementById("nomeCompleto").value = "";
  document.getElementById("emailPesquisa").value = "";

  // limpar erros
  document.getElementById("erroNome").textContent = "";
  document.getElementById("erroEmail").textContent = "";

  // reset selects
  [
    "selectInteresse",
    "selectCurso",
    "selectFormato",
    "selectDiasAoVivo",
    "selectLocal",
    "selectRegional",
    "selectDiasPresencial"
  ].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.value = "";
    el.classList.remove("open");
    el.querySelector(".custom-select__selected").textContent = "Selecione";
  });

  // reset botão de conclusão
  const btnConcluir = document.getElementById("btnConcluirPesquisa");
  if (btnConcluir) btnConcluir.style.display = "none";
}

// ===============================
// FINALIZAR PESQUISA
// ===============================
function finalizarPesquisa() {

  const interesse = document.getElementById("selectInteresse").dataset.value;
  const curso = document.getElementById("selectCurso").dataset.value;

  const erroInteresse = document.getElementById("erroInteresse");
  const erroCurso = document.getElementById("erroCurso");

  let valido = true;

  erroInteresse.textContent = "";
  erroCurso.textContent = "";

  if (!interesse) {
    erroInteresse.textContent = "Campo obrigatório.";
    valido = false;
  }

  if (interesse === "sim" && !curso) {
    erroCurso.textContent = "Campo obrigatório.";
    valido = false;
  }

  if (valido) {
    abrirObrigado();
    fecharModal();
  }
}

// ===============================
// POPUP OBRIGADO
// ===============================
function abrirObrigado() {
  const popup = document.getElementById("popupObrigado");

  if (!popup) return;

  popup.style.display = "flex";
  popup.classList.add("is-open"); // 🔥 ESSENCIAL
}

function fecharTudo() {
  document.getElementById("popupObrigado").style.display = "none";

  // 🔒 trava para não abrir novamente
  modalJaAberto = true;
}

// ===============================
// CUSTOM SELECT - INTERESSE
// ===============================
function initSelectInteresse() {
  const select = document.getElementById("selectInteresse");
  if (!select) return;

  const selected = select.querySelector(".custom-select__selected");
  const options = select.querySelector(".custom-select__options");

  // abrir/fechar
  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach(s => {
      if (s !== select) s.classList.remove("open");
    });
    select.classList.toggle("open");
  });

  // selecionar opção
  options.querySelectorAll("div").forEach(opt => {
    opt.addEventListener("click", (e) => {

      e.stopPropagation(); // 🔥 IMPORTANTE

      const value = opt.dataset.value;
      selected.textContent = opt.textContent;

      select.classList.remove("open");

      // 🔥 SALVA O VALOR NO SELECT
      select.dataset.value = value;

      // 🔥 CONTROLE DA SEGUNDA PERGUNTA
      const pergunta = document.getElementById("perguntaCurso");

      if (!pergunta) return;

      // 🔥 CONTROLE CORRETO
      if (value === "sim") {
        pergunta.style.display = "flex";

        // 🔥 força reflow (importante pra animação)
        pergunta.offsetHeight;

        pergunta.style.opacity = "1";
        pergunta.style.transform = "translateY(0)";
      } else {
        pergunta.style.opacity = "0";
        pergunta.style.transform = "translateY(10px)";

        // espera animação antes de esconder
        setTimeout(() => {
          pergunta.style.display = "none";
        }, 300);
      }

      // 🔥 FECHAR + OBRIGADO (SEM REABRIR)
      if (value === "nao") {
        modalJaAberto = true;

        // 🔥 fecha só o modal visualmente
        document.getElementById("researchModal").style.display = "none";

        // 🔥 abre obrigado
        abrirObrigado();
      }

    });
  });

  // fechar ao clicar fora
  document.addEventListener("click", () => {
    select.classList.remove("open");
  });

  select.addEventListener("click", function (e) {
    e.stopPropagation();
  });
}

function coletarRespostas() {
  const val = id => (document.getElementById(id) || {}).dataset?.value || "";
  return {
    nome:            document.getElementById("nomeCompleto")?.value || "",
    email:           document.getElementById("emailPesquisa")?.value || "",
    interesse:       val("selectInteresse"),
    curso:           val("selectCurso"),
    formato:         val("selectFormato"),
    diasAoVivo:      val("selectDiasAoVivo"),
    local:           val("selectLocal"),
    regional:        val("selectRegional"),
    diasPresencial:  val("selectDiasPresencial"),
    respondidoEm:    new Date().toISOString()
  };
}

function finalizarFluxoPesquisa() {
  localStorage.setItem("pesquisaRespondida", "true");

  const respostas = coletarRespostas();

  if (window.db) {
    window.db.collection("pesquisas").add(respostas).catch(err => {
      console.error("Erro ao salvar pesquisa:", err);
    });
  }

  document.getElementById("researchModal").style.display = "none";

  const popup = document.getElementById("popupObrigado");
  popup.querySelector("h2").textContent =
    "Obrigado por participar da pesquisa. Em breve você receberá mais informações sobre nossos cursos.";

  abrirObrigado();
}

function mostrarBotaoConcluir() {
  const btn = document.getElementById("btnConcluirPesquisa");
  if (btn) btn.style.display = "block";
}

function resetSelect(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.value = "";
  el.classList.remove("open");
  el.querySelector(".custom-select__selected").textContent = "Selecione";
}

function resetFrom(perguntaIds, selectIds) {
  perguntaIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  selectIds.forEach(resetSelect);
  const btn = document.getElementById("btnConcluirPesquisa");
  if (btn) btn.style.display = "none";
}

function initCustomSelect(id, onSelect) {
  const select = document.getElementById(id);
  if (!select) return;
  const selected = select.querySelector(".custom-select__selected");
  const options = select.querySelector(".custom-select__options");

  selected.addEventListener("click", function (e) {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach(s => {
      if (s !== select) s.classList.remove("open");
    });
    select.classList.toggle("open");
  });

  options.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      selected.textContent = this.textContent;
      select.dataset.value = this.dataset.value;
      select.classList.remove("open");
      if (onSelect) onSelect(this.dataset.value);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSelectInteresse();

  initCustomSelect("selectCurso", val => {
    resetFrom(
      ["perguntaFormato", "perguntaDiasAoVivo", "perguntaLocal", "perguntaRegional", "perguntaDiasPresencial"],
      ["selectFormato", "selectDiasAoVivo", "selectLocal", "selectRegional", "selectDiasPresencial"]
    );
    if (val === "bacharel" || val === "basico" || val === "professor") {
      document.getElementById("perguntaFormato").style.display = "flex";
    } else if (val === "cfam") {
      document.getElementById("perguntaLocal").style.display = "flex";
    }
  });

  initCustomSelect("selectFormato", val => {
    resetFrom(
      ["perguntaDiasAoVivo", "perguntaLocal", "perguntaRegional", "perguntaDiasPresencial"],
      ["selectDiasAoVivo", "selectLocal", "selectRegional", "selectDiasPresencial"]
    );
    if (val === "ao-vivo") document.getElementById("perguntaDiasAoVivo").style.display = "flex";
    else if (val === "ead") mostrarBotaoConcluir();
    else if (val === "presencial") document.getElementById("perguntaLocal").style.display = "flex";
  });

  initCustomSelect("selectDiasAoVivo", () => mostrarBotaoConcluir());

  initCustomSelect("selectLocal", val => {
    resetFrom(
      ["perguntaRegional", "perguntaDiasPresencial"],
      ["selectRegional", "selectDiasPresencial"]
    );
    if (val === "nucleo") document.getElementById("perguntaRegional").style.display = "flex";
    else document.getElementById("perguntaDiasPresencial").style.display = "flex";
  });

  initCustomSelect("selectRegional", () => {
    document.getElementById("perguntaDiasPresencial").style.display = "flex";
  });

  initCustomSelect("selectDiasPresencial", () => mostrarBotaoConcluir());
});