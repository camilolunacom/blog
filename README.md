# Camilo Luna

Blog personal de Camilo Luna, publicado en `https://www.camiloluna.com`.

El sitio está construido con Astro y se despliega como sitio estático en Cloudflare Pages.

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
3. validación de posts y rutas esperadas
4. build estático
5. validación de canonical, RSS, sitemap y salida generada

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
- Production branch: `master`

La URL canónica es `https://www.camiloluna.com` también en previews.
