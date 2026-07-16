# AGENTS.md

## Propósito del repositorio

Este repositorio contiene el blog personal de Camilo Luna, publicado en `https://www.camiloluna.com`.

El sitio está construido con Astro, JavaScript vanilla y salida estática para Cloudflare Pages.

## Reglas no negociables

1. No cambiar URLs publicadas sin aprobación explícita.
2. Los posts deben seguir disponibles en rutas raíz `/<slug>/`; no moverlos a `/blog/<slug>/`.
3. Mantener trailing slash en páginas y posts publicados.
4. No editar la prosa, títulos, fechas o enlaces de los posts salvo instrucción explícita de Camilo.
5. No mezclar cambios de contenido con rediseños o cambios de arquitectura sin pedir aprobación.
6. No introducir SSR, Cloudflare Functions/Workers ni frameworks de UI si el sitio puede seguir siendo estático.
7. No añadir CMS, analytics, comentarios, búsqueda o features no solicitadas.
8. Nunca afirmar paridad, build o deploy exitoso sin ejecutar y reportar la validación real.
9. No introducir TypeScript; usar JavaScript vanilla y JSDoc solo cuando aporte valor claro.
10. No añadir el adapter de Cloudflare mientras el sitio pueda generarse completamente durante el build.

## Arquitectura actual

- Astro con JavaScript vanilla.
- Output completamente estático en `dist/`.
- npm con `package-lock.json`.
- Content collection validada en build para los posts.
- Posts generados en `/<slug>/`.
- Páginas fijas: `/`, `/archivo/`, `/ahora/`, `/yo/` y `/404.html`.
- RSS en `/feed.xml`.
- Sitemap en `/sitemap.xml`.
- URL canónica: `https://www.camiloluna.com`.
- Redirect permanente de `https://camiloluna.com` hacia `https://www.camiloluna.com`.
- Cloudflare Pages: build `npm run build`, output `dist`, sin adapter ni Functions.
- Production branch: `master`.
- Adobe Typekit se conserva.
- La 404 está en español y usa el mismo lenguaje visual del sitio.

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
- No corregir enlaces rotos o errores editoriales preexistentes silenciosamente; documentarlos y pedir decisión.

## Flujo de trabajo

1. Trabajar en una rama dedicada desde `master` limpio.
2. Implementar en commits pequeños y revisables.
3. Ejecutar validación después de cada bloque relevante.
4. Para cambios visuales, entregar screenshots desktop/móvil antes de abrir o mergear el PR.
5. Abrir PR; no hacer push directo a `master`.
6. Tras aprobación explícita o instrucción directa de Camilo, hacer merge.
7. Verificar el deploy de Cloudflare Pages después del merge.
8. Cambiar DNS o configuración de dominio únicamente con instrucción explícita de Camilo.

## Comandos de calidad

Estos comandos deben funcionar desde un checkout limpio:

```bash
npm ci
npm run check
npm test
npm run build
npm run validate
```

`npm run validate` debe incluir como mínimo check, tests, build y validación de rutas/output.

## Definition of Done

Un cambio está terminado cuando:

- El build limpio pasa.
- `npm run validate` pasa.
- Las rutas afectadas fueron verificadas localmente o en Cloudflare Pages, según aplique.
- RSS, sitemap, canonical y assets siguen funcionando si el cambio los toca.
- No queda sintaxis sin procesar ni HTML roto introducido por el cambio.
- El PR fue mergeado a `master` cuando Camilo lo pidió.
- El deploy de Cloudflare Pages fue verificado después del merge si el cambio afecta producción.
