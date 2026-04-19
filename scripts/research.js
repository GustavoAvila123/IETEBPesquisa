/* ── MODULE: RESEARCH MODAL ── */

let modalJaAberto = false;

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.getElementById("researchModal");
  const modalBox = document.querySelector(".modal-box");

  const answered = localStorage.getItem("pesquisaRespondida") === "true";
  const btnPesquisa = document.getElementById("btnResponderPesquisa");
  const btnConheca  = document.getElementById("btnConhecaIETEB");
  const subtitleEl  = document.getElementById("loginCardSubtitle");

  if (btnPesquisa) {
    btnPesquisa.style.display = answered ? "none" : "";
    btnPesquisa.addEventListener("click", function () {
      if (modalJaAberto) return;
      modal.style.display = "flex";
      modalJaAberto = true;
    });
  }

  if (subtitleEl) {
    subtitleEl.style.display = answered ? "" : "none";
  }

  if (btnConheca) {
    btnConheca.style.display = answered ? "" : "none";
  }

  function mostrarFeedbackLogin() {
    if (localStorage.getItem("pesquisaRespondida") === "true") {
      const popup = document.getElementById("popupPlataforma");
      if (popup) popup.style.display = "flex";
    } else {
      const popup = document.getElementById("popupResponda");
      if (popup) popup.style.display = "flex";
    }
  }

  ["email", "password", "loginSubmitBtn", "forgotPasswordLink", "registerLink"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", mostrarFeedbackLogin);
  });

  if (modalBox) {
    modalBox.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  const nomeInput = document.getElementById("nomeCompleto");
  const telefoneInput = document.getElementById("telefonePesquisa");
  const emailInput = document.getElementById("emailPesquisa");

  if (nomeInput) {
    nomeInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, "");
      const erroNome = document.getElementById("erroNome");
      const valor = this.value.trim();
      erroNome.textContent = !valor ? "" : !valor.includes(" ") ? "Digite nome e sobrenome." : "";
    });
  }

  if (telefoneInput) {
    telefoneInput.addEventListener("input", function () {
      const d = this.value.replace(/\D/g, "").slice(0, 11);
      if (d.length === 0)       this.value = "";
      else if (d.length <= 2)   this.value = `(${d}`;
      else if (d.length <= 6)   this.value = `(${d.slice(0,2)}) ${d.slice(2)}`;
      else if (d.length <= 10)  this.value = `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
      else                      this.value = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;

      const erroTelefone = document.getElementById("erroTelefone");
      if (erroTelefone) erroTelefone.textContent = d.length >= 10 ? "" : d.length > 0 ? "Número incompleto." : "";
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function () {
      const valor = this.value.trim();
      const erroEmail = document.getElementById("erroEmail");
      erroEmail.textContent = !valor ? "" : (!valor.includes("@") || !valor.includes(".com")) ? "Digite um email válido." : "";
    });
  }

});

function validarPesquisa() {
  const nome     = document.getElementById("nomeCompleto").value.trim();
  const telefone = document.getElementById("telefonePesquisa").value.trim();
  const email    = document.getElementById("emailPesquisa").value.trim();

  const erroNome     = document.getElementById("erroNome");
  const erroTelefone = document.getElementById("erroTelefone");
  const erroEmail    = document.getElementById("erroEmail");

  let valido = true;
  erroNome.textContent = "";
  erroTelefone.textContent = "";
  erroEmail.textContent = "";

  if (!nome) {
    erroNome.textContent = "Campo obrigatório.";
    valido = false;
  } else if (!nome.includes(" ")) {
    erroNome.textContent = "Digite nome e sobrenome.";
    valido = false;
  }

  const digitos = telefone.replace(/\D/g, "");
  if (!telefone) {
    erroTelefone.textContent = "Campo obrigatório.";
    valido = false;
  } else if (digitos.length < 10) {
    erroTelefone.textContent = "Número incompleto.";
    valido = false;
  }

  if (!email) {
    erroEmail.textContent = "Campo obrigatório.";
    valido = false;
  } else if (!email.includes("@") || !email.includes(".com")) {
    erroEmail.textContent = "Digite um email válido.";
    valido = false;
  }

  if (valido) {
    document.getElementById("etapaInicial").style.display = "none";
    document.getElementById("etapaPerguntas").style.display = "block";
  }
}

function fecharModal() {
  closePickerModal();

  const modal = document.getElementById("researchModal");
  if (modal) modal.style.display = "none";

  modalJaAberto = false;

  document.getElementById("etapaInicial").style.display = "block";
  document.getElementById("etapaPerguntas").style.display = "none";

  document.getElementById("perguntaCurso").style.display = "none";
  document.getElementById("perguntaFormato").style.display = "none";
  document.getElementById("perguntaDiasAoVivo").style.display = "none";
  document.getElementById("perguntaLocal").style.display = "none";
  document.getElementById("perguntaRegional").style.display = "none";
  document.getElementById("perguntaDiasPresencial").style.display = "none";

  document.getElementById("nomeCompleto").value = "";
  document.getElementById("telefonePesquisa").value = "";
  document.getElementById("emailPesquisa").value = "";
  document.getElementById("erroNome").textContent = "";
  document.getElementById("erroTelefone").textContent = "";
  document.getElementById("erroEmail").textContent = "";

  [
    "selectInteresse", "selectCurso", "selectFormato",
    "selectDiasAoVivo", "selectLocal", "selectRegional", "selectDiasPresencial"
  ].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.value = "";
    el.classList.remove("open");
    el.querySelector(".custom-select__selected").textContent = "Selecione";
  });

  const btnConcluir = document.getElementById("btnConcluirPesquisa");
  if (btnConcluir) btnConcluir.style.display = "none";
}

function abrirObrigado() {
  const popup = document.getElementById("popupObrigado");
  if (!popup) return;
  popup.style.display = "flex";
  popup.classList.add("is-open");
}

const _FRASES_CURSOS = [
  "Desperte seu chamado.",
  "Aprofunde sua fé.",
  "Forme-se para servir.",
  "Ensine com excelência.",
  "Comece hoje."
];
let _fraseIdx = 0, _charIdx = 0, _apagando = false, _timerFrase = null;

function _typewriterCursos() {
  const el = document.getElementById("cursosFrase");
  if (!el) return;
  const frase = _FRASES_CURSOS[_fraseIdx];

  if (!_apagando) {
    el.textContent = frase.slice(0, ++_charIdx);
    if (_charIdx === frase.length) {
      _apagando = true;
      _timerFrase = setTimeout(_typewriterCursos, 1600);
    } else {
      _timerFrase = setTimeout(_typewriterCursos, 60);
    }
  } else {
    el.textContent = frase.slice(0, --_charIdx);
    if (_charIdx === 0) {
      _apagando = false;
      _fraseIdx = (_fraseIdx + 1) % _FRASES_CURSOS.length;
      _timerFrase = setTimeout(_typewriterCursos, 300);
    } else {
      _timerFrase = setTimeout(_typewriterCursos, 35);
    }
  }
}

function abrirExplorarCursos() {
  const modal = document.getElementById("modalExplorarCursos");
  if (!modal) return;
  modal.style.display = "flex";
  const box = modal.querySelector(".modal-box");
  if (box) box.scrollTop = 0;
  clearTimeout(_timerFrase);
  _charIdx = 0; _apagando = false;
  _typewriterCursos();
}

function fecharExplorarCursos() {
  const modal = document.getElementById("modalExplorarCursos");
  if (modal) modal.style.display = "none";
  clearTimeout(_timerFrase);
  const el = document.getElementById("cursosFrase");
  if (el) el.textContent = "";
}

function abrirConhecaIETEB() {
  const modal = document.getElementById("modalConhecaIETEB");
  if (modal) modal.style.display = "flex";
}

function fecharConhecaIETEB() {
  const modal = document.getElementById("modalConhecaIETEB");
  if (modal) modal.style.display = "none";
}

function fecharPopupResponda() {
  const popup = document.getElementById("popupResponda");
  if (popup) popup.style.display = "none";
}

function fecharPopupPlataforma() {
  const popup = document.getElementById("popupPlataforma");
  if (popup) popup.style.display = "none";
}

function fecharTudo() {
  document.getElementById("popupObrigado").style.display = "none";

  const answered = localStorage.getItem("pesquisaRespondida") === "true";
  if (answered) {
    modalJaAberto = true;
    const btn = document.getElementById("btnResponderPesquisa");
    if (btn) btn.style.display = "none";
    const subtitle = document.getElementById("loginCardSubtitle");
    if (subtitle) subtitle.style.display = "";
    const btnConheca = document.getElementById("btnConhecaIETEB");
    if (btnConheca) btnConheca.style.display = "";
  } else {
    modalJaAberto = false;
  }
}

function coletarRespostas() {
  const val = id => (document.getElementById(id) || {}).dataset?.value || "";
  return {
    nome:           document.getElementById("nomeCompleto")?.value || "",
    telefone:       document.getElementById("telefonePesquisa")?.value || "",
    email:          document.getElementById("emailPesquisa")?.value || "",
    interesse:      val("selectInteresse"),
    curso:          val("selectCurso"),
    formato:        val("selectFormato"),
    diasAoVivo:     val("selectDiasAoVivo"),
    local:          val("selectLocal"),
    regional:       val("selectRegional"),
    diasPresencial: val("selectDiasPresencial"),
    respondidoEm:   new Date().toISOString()
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

let _activePickerModal = null;

function openPickerModal(selectEl, onSelect) {
  if (_activePickerModal) closePickerModal();

  const label = selectEl.parentElement.querySelector("label")?.textContent || "";
  const options = Array.from(selectEl.querySelectorAll(".custom-select__options div"));
  const selected = selectEl.querySelector(".custom-select__selected");

  const backdrop = document.createElement("div");
  backdrop.className = "picker-modal-backdrop";

  const box = document.createElement("div");
  box.className = "picker-modal-box";

  const closeBtn = document.createElement("button");
  closeBtn.className = "picker-modal-close";
  closeBtn.type = "button";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", closePickerModal);

  const titleEl = document.createElement("div");
  titleEl.className = "picker-modal-title";
  titleEl.textContent = label;

  const optionsEl = document.createElement("div");
  optionsEl.className = "picker-modal-options";
  if (options.length >= 9) optionsEl.classList.add("three-col");
  else if (options.length >= 5) optionsEl.classList.add("two-col");

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "picker-modal-option";
    btn.type = "button";
    btn.textContent = opt.textContent;
    btn.addEventListener("click", () => {
      selected.textContent = opt.textContent;
      selectEl.dataset.value = opt.dataset.value;
      closePickerModal();
      if (onSelect) onSelect(opt.dataset.value);
    });
    optionsEl.appendChild(btn);
  });

  box.appendChild(closeBtn);
  box.appendChild(titleEl);
  box.appendChild(optionsEl);
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
  _activePickerModal = backdrop;
  lockPageScroll();
}

function closePickerModal() {
  if (!_activePickerModal) return;
  _activePickerModal.remove();
  _activePickerModal = null;
  unlockPageScroll();
}

function initCustomSelect(id, onSelect) {
  const select = document.getElementById(id);
  if (!select) return;
  const selected = select.querySelector(".custom-select__selected");

  selected.addEventListener("click", function (e) {
    e.stopPropagation();
    openPickerModal(select, onSelect);
  });
}

function initSelectInteresse() {
  const select = document.getElementById("selectInteresse");
  if (!select) return;
  const selected = select.querySelector(".custom-select__selected");

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    openPickerModal(select, (value) => {
      const pergunta = document.getElementById("perguntaCurso");
      if (!pergunta) return;

      if (value === "sim") {
        pergunta.style.display = "flex";
        pergunta.offsetHeight;
        pergunta.style.opacity = "1";
        pergunta.style.transform = "translateY(0)";
      } else {
        pergunta.style.opacity = "0";
        pergunta.style.transform = "translateY(10px)";
        setTimeout(() => { pergunta.style.display = "none"; }, 300);
      }

      if (value === "nao") {
        modalJaAberto = true;
        document.getElementById("researchModal").style.display = "none";

        try {
          const db = window.db ||
            (firebase.apps.find(a => a.name === "pesquisa") || firebase.apps[0])?.firestore();
          if (db) {
            db.collection("pesquisas").add({
              nome:         document.getElementById("nomeCompleto")?.value || "",
              telefone:     document.getElementById("telefonePesquisa")?.value || "",
              email:        document.getElementById("emailPesquisa")?.value || "",
              interesse:    "nao",
              respondidoEm: new Date().toISOString()
            }).catch(err => console.error("Erro ao salvar 'não':", err));
          }
        } catch (e) {
          console.error("Erro ao acessar Firestore:", e);
        }

        abrirObrigado();
      }
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
