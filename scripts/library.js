/* ── MODULE: LIBRARY ── */

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
      filename: "assets/docs/Raízes do vitimismo.pdf",
      title: "Raízes do vitimismo",
      tag: "PDF / Texto",
      videoFilename: "assets/media/Raízes do vitimismo Video.mp4",
      videoTag: "Video",
      fallbackSummary: "Uma leitura direta e necessária sobre como o vitimismo se forma, se alimenta e impacta decisões. Descubra os sinais sutis que prendem sua mente e como romper esse ciclo. Uma reflexão que muda postura e liderança."
    },
    {
      filename: "assets/docs/5_porques.pdf",
      title: "5 Porquês",
      tag: "PDF / Texto",
      videoFilename: "assets/media/5 Porques Video.mp4",
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
      downloadName: doc.filename.split("/").pop()
    });

    if (card && doc.videoFilename) {
      const metaEl = card.querySelector(".library-item__meta");
      const pillEl = card.querySelector(".library-item__pill--download");

      if (metaEl && pillEl) {
        const videoPill = document.createElement("a");
        videoPill.className = "library-item__pill library-item__pill--download";
        videoPill.textContent = doc.videoTag || "Video";
        videoPill.setAttribute("href", encodeURI(doc.videoFilename));
        videoPill.setAttribute("download", doc.videoFilename.split("/").pop());
        metaEl.insertBefore(videoPill, pillEl.nextSibling);
      }
    }

    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => extractPdfTextFromArrayBuffer(buf, 8000))
      .then((text) => {
        if (!card) return;
        if (doc.filename.endsWith("5_porques.pdf")) {
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
