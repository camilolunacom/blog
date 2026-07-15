# Migración de Jekyll a Astro + Cloudflare Pages — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Migrar `www.camiloluna.com` de Jekyll/GitHub Pages a un sitio Astro estático desplegado en Cloudflare Pages, sin rediseño inicial, sin cambios editoriales y sin romper URLs, SEO, RSS ni navegación.

**Architecture:** Astro generará HTML estático (`output: "static"`) desde content collections validadas en build. Los 28 posts conservarán sus slugs raíz actuales (`/<slug>/`), las páginas fijas conservarán sus rutas y los assets públicos permanecerán estables. Cloudflare Pages se conectará al repositorio de GitHub y solo recibirá el dominio después de validar un preview y comparar el sitio contra la versión Jekyll.

**Tech Stack:** Astro, JavaScript vanilla, Markdown, Sass, `@astrojs/rss`, `@astrojs/sitemap`, Node/npm, Cloudflare Pages.

---

## Alcance aprobado por defecto

### Incluido

- Paridad visual y funcional con el sitio actual.
- Las rutas actuales, incluyendo trailing slash.
- Home mostrando el post más reciente.
- Archivo cronológico.
- Páginas `/ahora/`, `/yo/`, `/archivo/` y `/404.html`.
- `/feed.xml`, `sitemap-index.xml`/sitemap generado, canonical URLs y metadatos SEO/sociales esenciales.
- Favicons, manifest y demás archivos estáticos.
- Deploy previews y producción en Cloudflare Pages.
- Validación automatizada del build y de las rutas históricas.
- Página 404 en español, integrada visualmente con el resto del sitio.

### Fuera de alcance en esta migración

- Rediseño visual.
- Reescritura o corrección editorial de posts.
- Cambiar tipografías, navegación o arquitectura de información.
- Añadir CMS, comentarios, búsqueda, analytics o funciones dinámicas.
- Introducir React/Vue/Svelte o un adapter de Cloudflare; el resultado debe seguir siendo estático.

## Estado actual verificado

- Rama publicada: `master`.
- 28 posts Markdown en `_posts/`.
- Jekyll usa `permalink: /:title/` y cinco posts tienen `permalink` explícito.
- Plugins actuales: `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`.
- Dominio: `www.camiloluna.com` (`CNAME`).
- Navegación: Inicio, Ahora, Yo.
- Home muestra únicamente el post más reciente y enlaza al archivo.
- CSS propio pequeño: Normalize + `mini-ghost.scss`.
- Hay HTML embebido en algunos posts y un embed de Twitter en `2021-04-16-silicolombia.md`.
- `ahora.md` usa atributos Kramdown `{:target="_blank"}`, sintaxis que Astro/remark no interpreta de forma nativa.

## Decisiones técnicas propuestas

1. Usar JavaScript vanilla con npm y guardar `package-lock.json`; no introducir TypeScript ni un framework frontend.
2. Usar Astro estático sin adapter de Cloudflare.
3. Configurar `site: "https://www.camiloluna.com"` y `trailingSlash: "always"`.
4. Mover posts a `src/content/blog/`, preservando el cuerpo y metadatos; añadir un `slug` explícito cuando sea necesario para que la URL no dependa del nombre interno del archivo.
5. Generar posts raíz mediante `src/pages/[slug].astro`; no introducir `/blog/`.
6. Mantener páginas fijas como páginas Astro/Markdown explícitas.
7. Mantener el CSS y Adobe Typekit existentes primero; cualquier rediseño o cambio tipográfico será un proyecto posterior.
8. Conectar Cloudflare Pages al repositorio de GitHub, con previews para ramas. Activar el despliegue automático de producción desde `master` únicamente después de aprobar el preview de la rama y confirmar la migración.
9. No cambiar DNS ni retirar GitHub Pages hasta que el preview esté aprobado.
10. Mantener `https://www.camiloluna.com` como URL canónica y redirigir el dominio apex `https://camiloluna.com` hacia `www`.

---

### Task 1: Crear rama y registrar el baseline publicado

**Objective:** Tener una referencia reproducible del sitio Jekyll y un inventario de URLs antes de modificarlo.

**Files:**
- Create: `scripts/capture-jekyll-routes.mjs`
- Create: `test/fixtures/jekyll-routes.json`
- Create: `test/fixtures/site-metadata.json`

**Steps:**

1. Crear la rama `feat/migrate-to-astro` desde `master` limpio.
2. Añadir `AGENTS.md` y `.hermes/` a `exclude` en `_config.yml` mientras Jekyll siga activo; contienen documentación técnica que Liquid no debe procesar ni publicar.
3. Ejecutar el build Jekyll actual en `.tmp/jekyll-site/` con `bundle exec jekyll build`; si el Ruby local no es compatible, usar una imagen oficial de Jekyll sin alterar el contenido.
4. Capturar todas las rutas HTML y XML generadas, sus títulos, canonical URLs y códigos esperados.
5. Guardar un manifiesto ordenado en `test/fixtures/jekyll-routes.json`.
6. Confirmar explícitamente que están `/`, `/archivo/`, `/ahora/`, `/yo/`, `/404.html`, `/feed.xml` y los 28 posts.
7. Tomar screenshots de referencia de home, un post, archivo, ahora y yo, en viewport desktop y móvil.
8. No incluir `.tmp/` ni screenshots temporales en el commit salvo que se acuerde conservarlos como fixtures.
9. Commit: `test: capture Jekyll migration baseline`.

**Verification:** El baseline debe generar sin modificar el árbol de trabajo y el manifiesto debe tener una entrada única por URL publicada.

---

### Task 2: Inicializar Astro sin retirar Jekyll

**Objective:** Añadir el toolchain Astro y obtener un build mínimo verificable mientras Jekyll todavía sirve como referencia.

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `jsconfig.json`
- Modify: `.gitignore`

**Steps:**

1. Inicializar Astro con JavaScript vanilla. No usar archivos `.ts`, interfaces ni anotaciones TypeScript.
2. Instalar Astro, `@astrojs/rss`, `@astrojs/sitemap` y `sass`; evitar frameworks de UI.
3. Definir scripts: `dev`, `build`, `preview`, `check` y `test`.
4. Configurar `site`, `output: "static"`, `trailingSlash: "always"` y sitemap.
5. Ignorar `node_modules/`, `dist/`, `.astro/` y `.tmp/`, conservando las entradas Jekyll hasta el retiro final.
6. Ejecutar `npm ci`, `npm run check` y `npm run build`.
7. Commit: `build: initialize static Astro site`.

**Verification:** `npm ci && npm run check && npm run build` termina con código 0 y crea `dist/`.

---

### Task 3: Definir configuración y esquema de contenido en JavaScript

**Objective:** Modelar y validar posts y metadata desde JavaScript sin perder compatibilidad con el frontmatter histórico.

**Files:**
- Create: `src/config/site.js`
- Create: `src/content.config.js`
- Create: `src/utils/posts.js`
- Create: `src/utils/urls.js`
- Create: `test/content.test.mjs`

**Steps:**

1. Definir título, autor, email, descripción, idioma, timezone y URL canónica en una única configuración.
2. Crear la colección `blog` con `title`, `date`, `permalink?`, `slug?`, `description?` y `draft?`.
3. Normalizar fechas con offset y ordenar posts de forma descendente.
4. Implementar un único helper para obtener el slug publicado: permalink explícito primero; slug migrado después; nombre histórico del archivo como fallback controlado.
5. Usar el esquema de la content collection para validación en build; añadir JSDoc solo donde mejore claramente la experiencia del editor.
6. Escribir pruebas para slugs explícitos, nombres con fecha, trailing slash, orden y unicidad.
7. Commit: `feat: define validated blog content model`.

**Verification:** Las pruebas fallan antes del helper, pasan después y detectan cualquier slug duplicado.

---

### Task 4: Migrar los 28 posts sin cambios editoriales

**Objective:** Llevar el contenido histórico a Astro conservando títulos, fechas, HTML embebido, links y URLs.

**Files:**
- Move: `_posts/*.md` → `src/content/blog/*.md`
- Modify only as needed: frontmatter de cada post
- Create: `scripts/validate-content-migration.mjs`

**Steps:**

1. Mover los 28 archivos manteniendo sus nombres reconocibles.
2. Añadir únicamente metadata técnica necesaria (`slug`, `description`, etc.); no corregir prosa ni enlaces rotos preexistentes.
3. Preservar los cinco `permalink` explícitos.
4. Asegurar que HTML crudo y el embed de Twitter se rendericen igual o documentar la diferencia antes de continuar.
5. Crear un validador que compare cantidad, título, fecha, slug y hash del cuerpo normalizado entre origen y destino.
6. Ejecutar pruebas de unicidad y el validador.
7. Commit: `content: migrate Jekyll posts to Astro`.

**Verification:** 28 entradas válidas, 28 slugs únicos y cero cambios no aprobados en el cuerpo de los posts.

---

### Task 5: Migrar estilos y shell visual

**Objective:** Reproducir el layout global y los estilos actuales sin rediseñarlos.

**Files:**
- Create: `src/styles/global.scss`
- Create: `src/styles/_normalize.scss`
- Create: `src/styles/_mini-ghost.scss`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Navigation.astro`
- Create: `src/components/Footer.astro`
- Create: `src/data/navigation.js`

**Steps:**

1. Portar Sass sin cambios visuales intencionales.
2. Crear HTML semántico equivalente al layout Jekyll.
3. Mantener Adobe Typekit existente inicialmente y cargarlo de forma no bloqueante como hoy.
4. Mantener navegación y footer actuales.
5. Añadir `lang="es"`, viewport, favicon links, manifest y theme color.
6. Ejecutar check/build y comparar screenshots del shell.
7. Commit: `feat: port Jekyll layout and styles`.

**Verification:** Comparación desktop/móvil sin regresiones visuales significativas; no se aceptan cambios de tipografía, ancho o espaciado como “mejoras” durante esta tarea.

---

### Task 6: Implementar SEO y metadata base

**Objective:** Reemplazar `jekyll-seo-tag` con metadata explícita y verificable.

**Files:**
- Create: `src/components/SeoHead.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `test/seo.test.mjs`

**Steps:**

1. Generar `title`, description, canonical, Open Graph y Twitter Card mínimos.
2. Usar title/description específicos cuando existan y fallback del sitio cuando no.
3. Publicar link alternativo a `/feed.xml`.
4. Evitar canonical duplicado y asegurar URLs absolutas sobre `https://www.camiloluna.com`.
5. Probar home, página fija y post.
6. Commit: `feat: add canonical SEO metadata`.

**Verification:** Cada HTML relevante tiene exactamente un title y un canonical correcto.

---

### Task 7: Implementar posts, home y archivo

**Objective:** Reproducir las tres vistas principales del blog con las rutas históricas.

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/PostArticle.astro`
- Create: `src/components/ArchiveItem.astro`
- Create: `src/pages/[slug].astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/archivo.astro`
- Create: `test/routes.test.mjs`

**Steps:**

1. Generar un path raíz por post mediante `getStaticPaths()`.
2. Renderizar fecha en `dd/mm/yyyy` y `datetime` ISO.
3. Mostrar en home el post más reciente y el enlace “Ver todos”.
4. Mostrar los 28 posts en archivo, de más reciente a más antiguo.
5. Validar que cada ruta histórica termina en `/` y genera `index.html` donde corresponda.
6. Commit: `feat: build post home and archive routes`.

**Verification:** Home muestra el mismo post que Jekyll; archivo tiene 28 entradas; cada URL del fixture Jekyll correspondiente a posts existe en `dist/`.

---

### Task 8: Migrar páginas fijas y 404

**Objective:** Reproducir Ahora, Yo y Archivo, y reemplazar la 404 genérica por una página breve en español, sin sintaxis exclusiva de Kramdown.

**Files:**
- Create: `src/pages/ahora.md` or `src/pages/ahora.astro`
- Create: `src/pages/yo.md` or `src/pages/yo.astro`
- Create: `src/pages/404.astro`
- Remove later: `ahora.md`, `yo.md`, `archivo.md`, `index.md`, `404.html`

**Steps:**

1. Migrar cuerpos sin cambios editoriales.
2. Convertir `{:target="_blank"}` a HTML compatible, añadiendo `rel="noopener noreferrer"` cuando aplique.
3. Conservar `/ahora/`, `/yo/` y `/404.html`.
4. Crear una 404 visualmente consistente con el blog con este contenido propuesto: título `404`, mensaje `No encontré esta página.`, explicación `Puede que la dirección haya cambiado o que la página ya no exista.` y enlaces `Volver al inicio` y `Ver el archivo`.
5. Commit: `feat: migrate static pages and 404`.

**Verification:** Las rutas y títulos coinciden con el baseline y no queda sintaxis Kramdown visible en el HTML.

---

### Task 9: Migrar assets, RSS y sitemap

**Objective:** Restituir todas las salidas automáticas y archivos públicos de Jekyll.

**Files:**
- Move: favicons, `manifest.json`, `browserconfig.xml`, `safari-pinned-tab.svg` → `public/`
- Create: `src/pages/feed.xml.js`
- Generated: sitemap mediante `@astrojs/sitemap`
- Create: `test/feed-sitemap.test.mjs`

**Steps:**

1. Copiar assets públicos conservando nombres y paths.
2. Generar RSS con título, descripción, fecha, link canónico y contenido o descripción equivalente al feed actual.
3. Generar sitemap con las URLs canónicas.
4. Probar XML válido, 28 posts en feed si el feed Jekyll actual incluye todos, y ausencia de URLs de preview.
5. Commit: `feat: add RSS sitemap and public assets`.

**Verification:** `/feed.xml`, sitemap y todos los favicons aparecen en `dist/` y usan el dominio de producción.

---

### Task 10: Crear la suite de paridad del build

**Objective:** Convertir “no romper el blog” en un gate automatizado.

**Files:**
- Create: `scripts/validate-build.mjs`
- Modify: `package.json`
- Update: tests bajo `test/`

**Steps:**

1. Validar presencia de todas las rutas del fixture Jekyll.
2. Validar status/ruta local, title, canonical, heading principal y fecha.
3. Detectar links internos a rutas inexistentes, excluyendo links históricamente rotos documentados si los hay.
4. Validar que no aparezcan tokens Liquid (`{{`, `{%`) ni atributos Kramdown sin procesar.
5. Añadir `npm test` y un comando agregado `npm run validate` que ejecute check, tests, build y validación del output.
6. Commit: `test: enforce Jekyll to Astro output parity`.

**Verification:** `npm ci && npm run validate` termina con código 0 desde un checkout limpio.

---

### Task 11: Retirar Jekyll y documentar desarrollo

**Objective:** Eliminar el toolchain anterior únicamente cuando Astro alcance paridad.

**Files:**
- Remove: `Gemfile`, `Gemfile.lock`, `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_data/`, `_posts/` y páginas raíz ya migradas
- Remove after Cloudflare cutover: `CNAME`
- Modify: `.gitignore`
- Create/Modify: `README.md`
- Preserve: `AGENTS.md`

**Steps:**

1. Borrar archivos Jekyll solo después de pasar la suite de paridad.
2. Mantener `CNAME` hasta definir si se necesita durante la convivencia; Cloudflare Pages no depende de ese archivo.
3. Documentar instalación, desarrollo, build, validación, estructura de contenido y publicación.
4. Ejecutar instalación limpia y validación completa.
5. Commit: `chore: remove Jekyll after Astro parity`.

**Verification:** No quedan Liquid/Jekyll/Ruby como dependencias y `npm ci && npm run validate` pasa.

---

### Task 12: Crear preview de Cloudflare Pages

**Objective:** Validar el sitio en infraestructura real sin tocar el dominio de producción.

**Cloudflare settings propuestas:**

- Framework preset: Astro.
- Production branch: `master`, habilitada para despliegue automático solo después de aprobar la rama de migración.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Node version: fijada a una versión LTS soportada mediante configuración del proyecto/archivo de versión.
- Root directory: `/`.
- Functions/Workers adapter: ninguno.

**Steps:**

1. Conectar el repositorio a Cloudflare Pages.
2. Desplegar la rama de migración como preview.
3. Ejecutar smoke tests contra la URL real de preview.
4. Comparar screenshots desktop/móvil de home, post, archivo, ahora, yo y 404.
5. Verificar headers, HTTPS, RSS, sitemap, assets y que los canonical sigan apuntando al dominio público, no al preview.
6. Entregar preview y comparación visual a Camilo para aprobación.

**Verification:** Preview estable, build reproducible y aprobación explícita antes del merge o DNS.

---

### Task 13: Revisión, PR y merge controlado

**Objective:** Integrar la migración sin mezclar cambios de diseño o contenido.

**Steps:**

1. Revisar diff completo buscando cambios editoriales accidentales.
2. Ejecutar revisión de seguridad/calidad y `npm audit` informativo; resolver vulnerabilidades relevantes sin upgrades arbitrarios.
3. Abrir PR con checklist de paridad, URL preview, screenshots y plan de rollback.
4. Esperar aprobación de Camilo.
5. Merge a `master`.
6. Verificar el deploy de producción de Cloudflare antes de tocar DNS.

**Verification:** Build de `master` verde y deploy accesible por el subdominio de Cloudflare Pages.

---

### Task 14: Migrar dominio y verificar producción

**Objective:** Mover `www.camiloluna.com` a Cloudflare Pages con rollback claro.

**Steps:**

1. Registrar los DNS actuales y reducir TTL con anticipación si todavía es útil.
2. Añadir `www.camiloluna.com` como custom domain y URL canónica en Pages.
3. Configurar un redirect permanente del apex `camiloluna.com` hacia `https://www.camiloluna.com`; no servir contenido duplicado desde ambos hosts.
4. Hacer el cambio DNS únicamente después de aprobación explícita.
5. Verificar certificado, redirect apex→www, home, cinco posts representativos, páginas fijas, 404, RSS, sitemap y canonical.
6. Monitorear errores y mantener GitHub Pages recuperable durante la ventana acordada.
7. Retirar configuración/CNAME de GitHub Pages solo después de estabilización.

**Verification:** Todas las URLs de producción responden sobre HTTPS, no hay loops de redirect y el dominio canónico es único.

---

## Criterios de aceptación

- `npm ci && npm run validate` pasa desde cero.
- Existen las mismas URLs públicas que en el baseline Jekyll.
- Los 28 posts conservan título, fecha, cuerpo y slug.
- Home y archivo conservan comportamiento y orden.
- RSS, sitemap, SEO, favicons y manifest funcionan.
- No quedan Liquid ni sintaxis Kramdown visible en el resultado.
- No hay rediseño ni cambios editoriales mezclados.
- El preview de Cloudflare es aprobado antes del merge.
- El DNS cambia solo con aprobación explícita y existe rollback documentado.

## Riesgos y mitigaciones

- **Cambio involuntario de slugs:** fixture de rutas + slugs explícitos + validación de unicidad.
- **Diferencias Markdown/Kramdown:** inventario de sintaxis especial, HTML raw y comparación de output.
- **Fechas desplazadas por timezone:** conservar offset `-0500`, ordenar por fecha absoluta y renderizar en `America/Bogota`.
- **Regresión SEO:** canonical, títulos, feed y sitemap validados por script.
- **Regresión visual:** paridad antes de rediseño y screenshots desktop/móvil.
- **Caída durante DNS:** preview primero, producción por subdominio Pages, TTL/rollback y retiro tardío de GitHub Pages.
- **Dependencia innecesaria de Cloudflare runtime:** output completamente estático, sin adapter ni Functions.

## Decisiones confirmadas por Camilo

1. Mantener paridad visual en la migración; no rediseñar.
2. Mantener `https://www.camiloluna.com` como dominio canónico y redirigir el apex hacia `www`.
3. Conservar Adobe Typekit por ahora.
4. Reemplazar la 404 genérica por una versión en español consistente con el sitio; el copy definitivo se aprueba antes de implementarlo.
5. Usar previews desde la rama de migración y, una vez confirmado el resultado, desplegar automáticamente desde `master`.
6. Usar JavaScript vanilla, no TypeScript.
7. Mantener output estático sin adapter de Cloudflare.
