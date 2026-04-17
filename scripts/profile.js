/* ── MODULE: PROFILE ── */

// Depends on: firebase-config, utils, validation

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
