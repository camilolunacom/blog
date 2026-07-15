# AGENTS.md

## Propósito del repositorio

Este repositorio contiene el blog personal de Camilo Luna, publicado en `https://www.camiloluna.com`.

La migración activa busca reemplazar Jekyll/GitHub Pages por Astro estático/Cloudflare Pages. La primera fase es una migración conservadora: paridad antes que mejoras.

## Fuente de verdad

Antes de implementar la migración, leer:

- `.hermes/plans/2026-07-14_195201-jekyll-astro-cloudflare-pages.md`

Si una instrucción posterior de Camilo contradice el plan, la instrucción posterior gana y el plan debe actualizarse antes de continuar.

## Reglas no negociables

1. No cambiar URLs publicadas sin aprobación explícita.
2. Los posts deben seguir disponibles en rutas raíz `/<slug>/`; no moverlos a `/blog/<slug>/`.
3. Mantener trailing slash en páginas y posts históricos.
4. No editar la prosa, títulos, fechas o enlaces de los posts como parte de la migración.
5. Solo se permiten cambios técnicos mínimos al contenido: frontmatter, slug explícito y conversión de sintaxis Jekyll/Kramdown incompatible.
6. No mezclar migración y rediseño. Primero reproducir el aspecto y comportamiento actuales.
7. No cambiar DNS ni desactivar GitHub Pages sin aprobación explícita de Camilo.
8. No introducir SSR, Cloudflare Functions/Workers ni frameworks de UI si el sitio puede seguir siendo estático.
9. No añadir CMS, analytics, comentarios, búsqueda o features no solicitadas.
10. Nunca afirmar paridad o deploy exitoso sin ejecutar y reportar la validación real.
11. No introducir TypeScript; usar JavaScript vanilla y JSDoc solo cuando aporte valor claro.
12. No añadir el adapter de Cloudflare mientras el sitio pueda generarse completamente durante el build.

## Arquitectura objetivo

- Astro con JavaScript vanilla.
- Output completamente estático en `dist/`.
- npm con `package-lock.json`.
- Content collection validada en build para los posts.
- Posts generados en `/<slug>/`.
- Páginas fijas: `/`, `/archivo/`, `/ahora/`, `/yo/` y `/404.html`.
- RSS en `/feed.xml`.
- Sitemap mediante `@astrojs/sitemap`.
- URL canónica: `https://www.camiloluna.com`.
- Redirect permanente de `https://camiloluna.com` hacia `https://www.camiloluna.com`.
- Cloudflare Pages: build `npm run build`, output `dist`, sin adapter ni Functions.
- Adobe Typekit se conserva durante la migración.
- La 404 debe estar en español y usar el mismo lenguaje visual del sitio.

## Convenciones de implementación

- Mantener componentes pequeños y específicos; evitar abstracciones anticipadas.
- Centralizar metadata del sitio en un solo módulo.
- Centralizar generación/normalización de slugs y URLs.
- Usar HTML semántico y preservar accesibilidad.
- No usar JavaScript cliente salvo necesidad demostrable.
- Usar `.js`/`.mjs`, no `.ts`; evitar tipos, interfaces y abstracciones propias de TypeScript.
- No añadir una librería cuando Astro/Node/CSS resuelva el caso de forma clara.
- Conservar nombres de archivos de contenido reconocibles.
- Los canonical deben apuntar al dominio de producción incluso en previews.
- Links con `target="_blank"` deben incluir `rel="noopener noreferrer"`.
- Preservar HTML crudo de posts; revisar especialmente embeds.

## Compatibilidad de contenido

El contenido viene de Jekyll/Kramdown. Antes de dar una migración por terminada, buscar y resolver:

- Tokens Liquid: `{{ ... }}` y `{% ... %}`.
- Atributos Kramdown como `{:target="_blank"}`.
- HTML embebido.
- Scripts/embeds, especialmente el post `2021-04-16-silicolombia.md`.
- Permalinks explícitos.
- Fechas con offset `-0500` y orden en timezone `America/Bogota`.

No corregir enlaces rotos o errores editoriales preexistentes silenciosamente; documentarlos y pedir decisión.

## Flujo de trabajo

1. Trabajar en una rama dedicada desde `master` limpio.
2. Mantener Jekyll hasta capturar el baseline y alcanzar paridad Astro.
3. Mientras Jekyll siga activo, excluir `AGENTS.md` y `.hermes/` en `_config.yml` para que Liquid no intente procesar documentación técnica.
4. Implementar en commits pequeños y revisables.
5. Ejecutar validación después de cada bloque relevante.
6. Crear preview en Cloudflare Pages desde la rama de migración.
7. Entregar URL y screenshots desktop/móvil antes del merge.
8. Abrir PR; no hacer push directo de la migración a `master`.
9. Tras aprobación explícita, hacer merge y usar despliegue automático desde `master`.
10. Cambiar DNS únicamente después de aprobación explícita.

## Comandos de calidad objetivo

Una vez inicializado Astro, estos comandos deben funcionar desde un checkout limpio:

```bash
npm ci
npm run check
npm test
npm run build
npm run validate
```

`npm run validate` debe incluir como mínimo check, tests, build y validación de rutas/output.

## Definition of Done

La migración solo está terminada cuando:

- Los 28 posts fueron migrados y sus cuerpos validados.
- Todas las rutas del baseline Jekyll existen en Astro.
- Home, archivo y páginas fijas conservan comportamiento; la 404 usa el copy aprobado en español.
- RSS, sitemap, canonical y assets funcionan.
- No queda sintaxis Liquid/Kramdown sin procesar.
- El build limpio pasa.
- El preview de Cloudflare fue verificado visual y funcionalmente.
- Camilo aprobó el resultado.
- El deploy automático desde `master` fue verificado después del merge.
- El apex redirige permanentemente a `www` sin contenido duplicado.
- El cutover de dominio fue verificado y tiene rollback documentado.
