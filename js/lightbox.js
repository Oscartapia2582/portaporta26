/* ============================================================
   LIGHTBOX — imágenes + embeds (Behance, Figma, Canva, Notion,
   Framer, Google Slides, Looker Studio, Power BI).
   ============================================================ */

window.Lightbox = (() => {
  let items = [];
  let index = 0;
  let root = null;

  /* Transforma URLs conocidas a su versión embebible. */
  function embedUrl(url) {
    try {
      const u = new URL(url);
      const h = u.hostname;
      if (h.includes("behance.net")) {
        const m = u.pathname.match(/gallery\/(\d+)/);
        return m ? `https://www.behance.net/embed/project/${m[1]}` : url;
      }
      if (h.includes("figma.com"))
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
      if (h.includes("canva.com"))
        return url.includes("?embed") ? url : url.replace(/\/(view|watch)/, "/view") + "?embed";
      if (h.includes("docs.google.com") && u.pathname.includes("/presentation/"))
        return url.replace(/\/(edit|pub).*/, "/embed");
      if (h.includes("lookerstudio.google.com"))
        return url.replace("/reporting/", "/embed/reporting/");
      if (h.includes("notion.site") || h.includes("framer.")) return url;
      if (h.includes("powerbi.com")) return url;
      return url;
    } catch { return url; }
  }

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Galería");
    root.innerHTML = `
      <div class="lightbox__content"></div>
      <button class="lightbox__btn lightbox__btn--prev" aria-label="Anterior">←</button>
      <button class="lightbox__btn lightbox__btn--next" aria-label="Siguiente">→</button>
      <button class="lightbox__btn lightbox__close" aria-label="Cerrar">✕</button>
      <span class="lightbox__counter"></span>`;
    document.body.appendChild(root);

    root.querySelector(".lightbox__close").addEventListener("click", close);
    root.querySelector(".lightbox__btn--prev").addEventListener("click", () => step(-1));
    root.querySelector(".lightbox__btn--next").addEventListener("click", () => step(1));
    root.addEventListener("click", (e) => { if (e.target === root) close(); });

    document.addEventListener("keydown", (e) => {
      if (!root.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function render() {
    const it = items[index];
    if (!it) return;
    const content = root.querySelector(".lightbox__content");
    if (it.embed) {
      content.innerHTML = `<iframe src="${embedUrl(it.embed)}" allowfullscreen loading="lazy" title="${it.alt || 'Proyecto embebido'}"></iframe>`;
    } else {
      content.innerHTML = `<img src="${it.src}" alt="${it.alt || ''}">`;
      const img = content.querySelector("img");
      img.addEventListener("load", () => {
        const tall = img.naturalHeight / img.naturalWidth > 1.6;
        content.classList.toggle("is-tall", tall && !it.native);
        if (it.native) {
          // Nunca ampliar un anuncio por encima de su tamaño real
          img.style.width = "auto";
          img.style.maxWidth = Math.min(img.naturalWidth, window.innerWidth * 0.92) + "px";
          if (img.naturalHeight <= window.innerHeight * 0.86) img.style.maxHeight = "none";
        }
        content.scrollTop = 0;
      });
      img.addEventListener("error", () => {
        content.innerHTML = `<p style="color:var(--paper-dim)">Imagen no disponible.</p>`;
      });
    }
    root.querySelector(".lightbox__counter").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  }

  function open(i) {
    build();
    index = i;
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    render();
  }

  function close() {
    root.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function step(dir) {
    index = (index + dir + items.length) % items.length;
    render();
  }

  function resetArrows(show) {
    const prev = root.querySelector(".lightbox__btn--prev");
    const next = root.querySelector(".lightbox__btn--next");
    prev.style.display = show ? "" : "none";
    next.style.display = show ? "" : "none";
  }

  /* Vincula clicks de una galería. */
  function bind(container, list) {
    container.addEventListener("click", (e) => {
      const fig = e.target.closest(".gallery__item");
      if (!fig) return;
      const i = parseInt(fig.dataset.index, 10);
      if (Number.isNaN(i)) return;
      build();
      items = list || [];
      resetArrows(items.length > 1);
      open(i);
    });
  }

  /* Abre un único embed (ej. el CV en PDF) sin galería. */
  function openEmbed(url, label) {
    build();
    items = [{ embed: url, alt: label || "" }];
    index = 0;
    resetArrows(false);
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    render();
    root.querySelector(".lightbox__counter").textContent = "";
  }

  return { bind, open, openEmbed };
})();
