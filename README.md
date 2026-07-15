# Camilo Luna

Blog personal de Camilo Luna, migrado de Jekyll a Astro estático para desplegar en Cloudflare Pages.

## Desarrollo

```bash
npm ci
npm run dev
```

## Validación

```bash
npm run validate
```

El comando ejecuta:

1. `astro check`
2. pruebas de helpers y contenido
3. validación de que los 28 posts migrados conservan metadata/cuerpo frente al fixture Jekyll
4. build estático
5. validación de rutas, canonical, RSS, sitemap y sintaxis Liquid/Kramdown sin procesar

## Build de producción

```bash
npm run build
```

Salida: `dist/`.

## Cloudflare Pages

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Runtime/adapters: ninguno; el sitio es completamente estático

La URL canónica sigue siendo `https://www.camiloluna.com` también en previews.
