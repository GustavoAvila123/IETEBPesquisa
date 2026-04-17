/* ── MODULE: TRAIL ── */

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

  trilhaCard.classList.add("is-collapsed");
  atualizarSetaTrilha();

  toggleBtn.replaceWith(toggleBtn.cloneNode(true));

  const newToggleBtn = document.getElementById("toggleTrilha");

  newToggleBtn.addEventListener("click", () => {
    trilhaCard.classList.toggle("is-collapsed");
    atualizarSetaTrilha();
  });
}

function resetTrilha() {
  const trilha = document.getElementById("trilhaCard");
  if (!trilha) return;
  trilha.classList.add("is-collapsed");
}

document.addEventListener("DOMContentLoaded", initTrilhaToggle);

document.addEventListener("DOMContentLoaded", () => {
  const flags = document.querySelectorAll("#tabTrail .flag-item");
  const progresso = document.getElementById("progressoTrilha");

  const savedFlags = JSON.parse(localStorage.getItem("trilhaFlags") || "[]");

  flags.forEach((flag, index) => {
    if (savedFlags[index]) {
      flag.classList.add("is-checked");
    }

    flag.addEventListener("click", () => {
      flag.classList.toggle("is-checked");

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
    if (progresso) progresso.innerText = `${marcados}/${total}`;
  }

  atualizarProgresso();
});
