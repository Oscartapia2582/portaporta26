# Portafolio — Oscar Tapia

Sitio estático premium. Sin frameworks, sin build. Todo el contenido se controla desde **2 archivos**: nunca editas HTML.

## Antes de publicar (obligatorio)

1. Abre `js/config.js` y reemplaza los campos marcados con `← TODO` (email, teléfono, WhatsApp, redes).
2. Reemplaza `TU-DOMINIO.com` en `robots.txt` y `sitemap.xml`.
3. (Opcional) Sube tu foto a `assets/img/oscar-tapia.jpg`. Si no existe, el sitio no se rompe.

## Cómo agregar tus 200+ imágenes (el flujo completo)

**Regla de oro: las imágenes se nombran `01.jpg`, `02.jpg`, `03.jpg`...** El sitio genera las rutas solo. No listas archivos en ningún lado.

1. Crea una carpeta por proyecto dentro de su categoría:
   ```
   assets/img/branding-corporativo/marca-acme/
   ├── 01.jpg   ← portada (siempre)
   ├── 02.jpg
   └── 03.jpg
   ```
2. Agrega el proyecto en `data/projects.json` copiando el bloque de ejemplo:
   ```json
   {
     "id": "marca-acme",
     "categoria": "branding-corporativo",
     "folder": "marca-acme",
     "titulo": "Acme — Rebranding completo",
     "cliente": "Acme Corp",
     "anio": "2025",
     "descripcion": "Una frase que vende el proyecto.",
     "problema": "...", "objetivo": "...", "proceso": "...", "resultado": "...",
     "imageCount": 3,
     "featured": true
   }
   ```
   - `imageCount` = cuántas imágenes hay en la carpeta. Eso es todo.
   - `featured: true` lo muestra en la portada del sitio (usa 3–5 máximo).
   - Si usas `.webp` o `.png`, agrega `"ext": "webp"`.
   - Para embeber Behance/Figma/Canva/Google Slides, agrega `"embed": "URL"`.

3. **Optimización antes de subir** (no negociable con 200+ imágenes):
   - Máximo 1920px de ancho, JPEG calidad 75–80 o WebP.
   - Comando rápido si tienes ImageMagick: `mogrify -resize 1920x -quality 78 *.jpg`
   - Sin esto, el sitio se sentirá lento sin importar el diseño.

Categorías válidas (slugs exactos): `branding-corporativo`, `social-media`, `campanas-ooh`, `retoque-imagen`, `newsletter`, `campanas-google-media`.

## Probar en local

```
python3 -m http.server 8080
```
Abre http://localhost:8080 — **necesitas un servidor local** (el fetch de JSON no funciona abriendo el archivo directo).

## Deploy

- **Netlify**: arrastra la carpeta completa a app.netlify.com/drop. `netlify.toml` ya está configurado.
- **Vercel**: `vercel --prod` desde esta carpeta. `vercel.json` ya está configurado.

## Estructura

```
index.html          Portada
categoria.html      Galería por categoría (?cat=slug) con lightbox
proyecto.html       Caso de estudio (?id=proyecto)
css/main.css        Sistema de diseño completo
js/config.js        ← Tus datos personales (única fuente de verdad)
js/main.js          Render + interacciones
js/lightbox.js      Lightbox con embeds (Behance, Figma, Canva, Slides…)
data/projects.json  ← Tus proyectos (única fuente de contenido)
```

## Notas técnicas

- Todo el render es defensivo: una imagen faltante se oculta, nunca rompe el layout.
- Animaciones con red de seguridad: si algo falla, el contenido se revela a los 2.5s.
- `prefers-reduced-motion` respetado. Cursor custom solo en desktop.
- Los proyectos de ejemplo (`ejemplo-branding`, `ejemplo-social`) usan placeholders: bórralos de `projects.json` y de `assets/img/` cuando subas los reales.
