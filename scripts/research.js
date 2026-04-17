/* ── MODULE: RESEARCH MODAL ── */

let modalJaAberto = false;

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.getElementById("researchModal");
  const modalBox = document.querySelector(".modal-box");

  const answered = localStorage.getItem("pesquisaRespondida") === "true";
  const btnPesquisa = document.getElementById("btnResponderPesquisa");
  const subtitleEl = document.getElementById("loginCardSubtitle");

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

function validarPesquisa() {
  const nome = document.getElementById("nomeCompleto").value.trim();
  const email = document.getElementById("emailPesquisa").value.trim();

  const erroNome = document.getElementById("erroNome");
  const erroEmail = document.getElementById("erroEmail");

  let valido = true;
  erroNome.textContent = "";
  erroEmail.textContent = "";

  if (!nome) {
    erroNome.textContent = "Campo obrigatório.";
    valido = false;
  } else if (!nome.includes(" ")) {
    erroNome.textContent = "Digite nome e sobrenome.";
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
  document.getElementById("emailPesquisa").value = "";
  document.getElementById("erroNome").textContent = "";
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
  } else {
    modalJaAberto = false;
  }
}

function coletarRespostas() {
  const val = id => (document.getElementById(id) || {}).dataset?.value || "";
  return {
    nome:           document.getElementById("nomeCompleto")?.value || "",
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
    "Obrigado por responder a esta pesquisa, em breve você receberá mais informações";

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

function initSelectInteresse() {
  const select = document.getElementById("selectInteresse");
  if (!select) return;

  const selected = select.querySelector(".custom-select__selected");
  const options = select.querySelector(".custom-select__options");

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach(s => {
      if (s !== select) s.classList.remove("open");
    });
    select.classList.toggle("open");
  });

  options.querySelectorAll("div").forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = opt.dataset.value;
      selected.textContent = opt.textContent;
      select.classList.remove("open");
      select.dataset.value = value;

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
        abrirObrigado();
      }
    });
  });

  document.addEventListener("click", () => {
    select.classList.remove("open");
  });

  select.addEventListener("click", function (e) {
    e.stopPropagation();
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
