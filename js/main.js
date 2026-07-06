/* ============================================================
   MAIN — Render dirigido por data/projects.json + interacciones.
   Principio: nada falla en silencio, nada rompe el layout.
   ============================================================ */

const App = (() => {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Datos ---------- */
  let DATA = null;

  async function loadData() {
    try {
      const res = await fetch("data/projects.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      DATA = await res.json();
    } catch (e) {
      console.error("No se pudo cargar data/projects.json:", e);
      DATA = { categorias: [], proyectos: [] };
    }
    return DATA;
  }

  const imgPath = (p, n) =>
    `assets/img/${p.categoria}/${p.folder}/${String(n).padStart(2, "0")}.${p.ext || "jpg"}`;

  const cover = (p) => p.cover || imgPath(p, 1);

  const byCat = (slug) => (DATA?.proyectos || []).filter((p) => p.categoria === slug);

  /* ---------- Reveal on scroll (con red de seguridad) ---------- */
  function initReveals() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));

    // Red de seguridad: pase lo que pase, todo visible a los 2.5s.
    setTimeout(() => els.forEach((el) => el.classList.add("in")), 2500);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Cursor custom ---------- */
  function initCursor() {
    if (!FINE_POINTER || REDUCED) return;
    const dot = document.createElement("div");
    dot.className = "cursor";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);

    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.classList.add("is-visible");
    }, { passive: true });

    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", (e) => {
      dot.classList.toggle("is-hover", !!e.target.closest("a, button, .gallery__item"));
    });
  }

  /* ---------- Botones magnéticos ---------- */
  function initMagnetic() {
    if (!FINE_POINTER || REDUCED) return;
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 500ms cubic-bezier(0.16,1,0.3,1)";
        btn.style.transform = "";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });
  }

  /* ---------- HOME: index de trabajo ---------- */
  function renderWorkIndex() {
    const wrap = document.getElementById("work-index");
    if (!wrap) return;

    const rows = DATA.categorias.map((cat, i) => {
      const projs = byCat(cat.slug);
      const count = projs.length;
      const first = projs[0];
      const preview = first ? cover(first) : "";
      let label = "próximamente";
      if (count === 1) {
        const n = projs[0].imageCount || 0;
        label = n > 0 ? `${n} piezas` : "1 proyecto";
      } else if (count > 1) {
        label = `${count} proyectos`;
      }
      return `
        <a class="work-row" href="categoria.html?cat=${cat.slug}" data-preview="${preview}">
          <span class="work-row__num">0${i + 1}</span>
          <span class="work-row__title">${cat.nombre}</span>
          <span class="work-row__tag">${cat.tag}</span>
          <span class="work-row__count">${label}</span>
          <span class="work-row__arrow" aria-hidden="true">↗</span>
        </a>`;
    }).join("");
    wrap.innerHTML = rows;

    // Preview flotante que sigue el cursor
    if (!FINE_POINTER || REDUCED) return;
    const preview = document.createElement("div");
    preview.className = "work-preview";
    preview.setAttribute("aria-hidden", "true");
    const pimg = document.createElement("img");
    pimg.alt = "";
    pimg.addEventListener("error", () => preview.classList.remove("is-active"));
    preview.appendChild(pimg);
    document.body.appendChild(preview);

    let px = 0, py = 0, tx = 0, ty = 0, active = false;
    (function loop() {
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;
      preview.style.left = px + 16 + "px";
      preview.style.top = py - 100 + "px";
      requestAnimationFrame(loop);
    })();

    wrap.querySelectorAll(".work-row").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        const src = row.dataset.preview;
        if (!src) return;
        pimg.src = src;
        active = true;
        preview.classList.add("is-active");
      });
      row.addEventListener("mouseleave", () => {
        active = false;
        preview.classList.remove("is-active");
      });
      row.addEventListener("mousemove", (e) => {
        if (!active) return;
        tx = e.clientX; ty = e.clientY;
      }, { passive: true });
    });
  }

  /* ---------- HOME: destacados ---------- */
  function renderFeatured() {
    const wrap = document.getElementById("featured");
    if (!wrap) return;
    const feats = (DATA.proyectos || []).filter((p) => p.featured);
    if (!feats.length) {
      const section = wrap.closest("section");
      if (section) section.style.display = "none";
      return;
    }
    wrap.innerHTML = feats.map((p) => {
      const cat = DATA.categorias.find((c) => c.slug === p.categoria);
      return `
        <a class="feature reveal" href="proyecto.html?id=${p.id}">
          <div class="feature__media">
            <img src="${cover(p)}" alt="${p.titulo}" loading="lazy"
                 onerror="this.closest('.feature').style.display='none'">
          </div>
          <div class="feature__body">
            <div>
              <p class="feature__cat">${cat ? cat.nombre : ""} — ${p.anio || ""}</p>
              <h3 class="feature__title">${p.titulo}</h3>
            </div>
            <p class="feature__desc">${p.descripcion || ""}</p>
            <span class="btn">Ver caso <span class="arrow">→</span></span>
          </div>
        </a>`;
    }).join("");
  }

  /* ---------- CATEGORÍA: galería masonry + lightbox ---------- */
  function renderCategoria() {
    const wrap = document.getElementById("gallery");
    if (!wrap) return;

    const slug = new URLSearchParams(location.search).get("cat");
    const cat = DATA.categorias.find((c) => c.slug === slug) || DATA.categorias[0];
    if (!cat) { wrap.innerHTML = "<p class='prose'>Categoría no encontrada.</p>"; return; }

    const titleEl = document.getElementById("cat-title");
    const tagEl = document.getElementById("cat-tag");
    if (titleEl) titleEl.textContent = cat.nombre;
    if (tagEl) tagEl.textContent = cat.tag;
    document.title = `${cat.nombre} — Oscar Tapia`;

    const items = [];
    let allNative = true;
    byCat(cat.slug).forEach((p) => {
      const native = p.display === "native";
      if (!native) allNative = false;
      for (let n = 1; n <= (p.imageCount || 0); n++) {
        items.push({ src: imgPath(p, n), alt: `${p.titulo} — ${n}`, embed: null, projectId: p.id, native });
      }
      if (p.embed) items.push({ src: cover(p), alt: p.titulo, embed: p.embed, projectId: p.id, native: false });
    });

    if (!items.length) {
      wrap.innerHTML = `<p class="prose">Proyectos de <strong>${cat.nombre}</strong> en preparación. Vuelve pronto.</p>`;
      return;
    }

    wrap.classList.toggle("gallery--native", allNative);
    wrap.innerHTML = items.map((it, i) => `
      <figure class="gallery__item" data-index="${i}">
        <img src="${it.src}" alt="${it.alt}" loading="lazy"
             onload="this.classList.add('is-loaded');var c=this.parentElement.querySelector('.gallery__caption');if(c)c.textContent=this.naturalWidth+' × '+this.naturalHeight;"
             onerror="this.closest('.gallery__item').remove()">
        ${it.native ? `<figcaption class="gallery__caption"></figcaption>` : ""}
      </figure>`).join("");

    if (window.Lightbox) window.Lightbox.bind(wrap, items);
  }

  /* ---------- PROYECTO: caso de estudio ---------- */
  function renderProyecto() {
    const root = document.getElementById("project");
    if (!root) return;

    const id = new URLSearchParams(location.search).get("id");
    const p = (DATA.proyectos || []).find((x) => x.id === id);
    if (!p) {
      root.innerHTML = `<div class="container section"><p class="prose">Proyecto no encontrado. <a href="index.html" style="border-bottom:1px solid currentColor">Volver al inicio</a></p></div>`;
      return;
    }
    const cat = DATA.categorias.find((c) => c.slug === p.categoria);
    document.title = `${p.titulo} — Oscar Tapia`;

    const secciones = [
      ["El problema", p.problema],
      ["El objetivo", p.objetivo],
      ["El proceso", p.proceso],
      ["El resultado", p.resultado]
    ].filter(([, v]) => v && v.trim());

    const galeria = [];
    for (let n = 1; n <= (p.imageCount || 0); n++) {
      galeria.push({ src: imgPath(p, n), alt: `${p.titulo} — ${n}` });
    }

    root.innerHTML = `
      <header class="project-hero container">
        <p class="kicker">${cat ? cat.nombre : ""}</p>
        <h1 class="display">${p.titulo}</h1>
        <dl class="project-meta">
          ${p.cliente ? `<div><dt>Cliente</dt><dd>${p.cliente}</dd></div>` : ""}
          ${p.anio ? `<div><dt>Año</dt><dd>${p.anio}</dd></div>` : ""}
          <div><dt>Categoría</dt><dd>${cat ? cat.nombre : ""}</dd></div>
        </dl>
        ${p.descripcion ? `<p class="lead">${p.descripcion}</p>` : ""}
        <div class="project-cover">
          <img src="${cover(p)}" alt="${p.titulo}"
               onerror="this.closest('.project-cover').style.display='none'">
        </div>
      </header>
      <div class="container section--tight project-body">
        ${secciones.map(([t, v]) => `
          <section class="reveal">
            <h2>${t}</h2>
            <p class="prose" style="margin-top:0.75rem">${v}</p>
          </section>`).join("")}
        <div class="gallery" id="project-gallery">
          ${galeria.map((g, i) => `
            <figure class="gallery__item" data-index="${i}">
              <img src="${g.src}" alt="${g.alt}" loading="lazy"
                   onload="this.classList.add('is-loaded')"
                   onerror="this.closest('.gallery__item').remove()">
            </figure>`).join("")}
        </div>
      </div>`;

    const gwrap = document.getElementById("project-gallery");
    if (gwrap && window.Lightbox) window.Lightbox.bind(gwrap, galeria);
    initReveals();
  }

  /* ---------- Curriculum: visor en la misma web ---------- */
  function initCV() {
    document.querySelectorAll('[data-pd="cv-view"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        // En móvil los iframes de PDF son poco fiables → pestaña nueva (comportamiento nativo del <a>).
        if (!FINE_POINTER || !window.Lightbox) return;
        e.preventDefault();
        const src = link.getAttribute("href");
        if (!src || src === "#") return;
        window.Lightbox.openEmbed(src, "Curriculum — Oscar Tapia");
      });
    });
  }

  /* ---------- Boot ---------- */
  async function init() {
    initNav();
    initCursor();
    await loadData();

    const page = document.body.dataset.page;
    if (page === "home") { renderWorkIndex(); renderFeatured(); }
    if (page === "categoria") renderCategoria();
    if (page === "proyecto") renderProyecto();

    initReveals();
    initMagnetic();
    initCV();
  }

  document.addEventListener("DOMContentLoaded", init);
  return { init };
})();
