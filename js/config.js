/* ============================================================
   CONFIG — Única fuente de verdad de datos personales.
   Edita SOLO este archivo para cambiar nombre, contacto, redes.
   ============================================================ */

const PersonalData = {
  // ── EDITAR AQUÍ ─────────────────────────────────────────
  name: "Oscar Tapia",
  role: "Diseñador Gráfico Senior & Especialista en Marketing Digital",
  location: "Santo Domingo, República Dominicana",
  availability: "Disponible para proyectos",

  email: "oscartapia_30@hotmail.com",
  phone: "+1 (829) 747-9929",
  whatsapp: "18297479929",              // ← VERIFICAR: asumí que tu WhatsApp es tu número principal

  cv: "assets/cv/oscar-tapia-cv-2026.pdf",

  social: {
    behance: "https://behance.net/TU-USUARIO",   // ← TODO
    linkedin: "https://linkedin.com/in/TU-USUARIO", // ← TODO
    instagram: "https://instagram.com/TU-USUARIO"   // ← TODO
  },

  // Foto para la sección "sobre mí" (opcional). Si el archivo no
  // existe, el sitio NO se rompe: el bloque simplemente se oculta.
  aboutPhoto: "assets/img/oscar-tapia.jpg",
  // ────────────────────────────────────────────────────────

  /**
   * Inyección defensiva. Regla: ningún elemento faltante rompe nada.
   * - [data-pd="email"]  → texto + href mailto
   * - [data-pd="phone"]  → texto + href tel
   * - [data-pd="whatsapp"] → href wa.me
   * - [data-pd="name"], [data-pd="role"], [data-pd="location"], [data-pd="availability"] → texto
   * - [data-pd="behance|linkedin|instagram"] → href
   * - [data-pd="about-photo"] → src con onerror que oculta el contenedor
   */
  inject() {
    const setAll = (key, fn) => {
      document.querySelectorAll(`[data-pd="${key}"]`).forEach((el) => {
        try { fn(el); } catch (e) { console.warn(`config.inject: fallo en "${key}"`, e); }
      });
    };

    setAll("name", (el) => (el.textContent = this.name));
    setAll("role", (el) => (el.textContent = this.role));
    setAll("location", (el) => (el.textContent = this.location));
    setAll("availability", (el) => (el.textContent = this.availability));

    setAll("email", (el) => {
      el.textContent = this.email;
      if (el.tagName === "A") el.href = `mailto:${this.email}`;
    });
    setAll("phone", (el) => {
      el.textContent = this.phone;
      if (el.tagName === "A") el.href = `tel:${this.phone.replace(/[^+\d]/g, "")}`;
    });
    setAll("whatsapp", (el) => {
      if (el.tagName === "A") el.href = `https://wa.me/${this.whatsapp}`;
    });

    // Curriculum: [data-pd="cv-view"] abre el PDF, [data-pd="cv-download"] lo descarga.
    setAll("cv-view", (el) => { if (el.tagName === "A") el.href = this.cv; });
    setAll("cv-download", (el) => {
      if (el.tagName === "A") {
        el.href = this.cv;
        el.setAttribute("download", "Oscar-Tapia-CV.pdf");
      }
    });

    ["behance", "linkedin", "instagram"].forEach((net) => {
      setAll(net, (el) => {
        if (el.tagName === "A" && this.social[net]) el.href = this.social[net];
      });
    });

    // Foto "sobre mí": nunca deja un <img> roto visible.
    setAll("about-photo", (el) => {
      const img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (!img) return;
      img.addEventListener("error", () => {
        const wrap = img.closest("[data-pd-photo-wrap]") || img;
        wrap.style.display = "none";
        console.warn("config.inject: aboutPhoto no encontrada, bloque ocultado:", this.aboutPhoto);
      });
      img.src = this.aboutPhoto;
    });
  }
};

document.addEventListener("DOMContentLoaded", () => PersonalData.inject());
