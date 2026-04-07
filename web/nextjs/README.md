# Pacific Surf Wellness Landing (Next.js)

Landing mobile-first para Pacific Surf School, orientada a conversion por WhatsApp y venta de paquetes de 4 y 8 clases.

## Requisitos

- Node.js 20+
- npm 10+

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir en navegador: `http://localhost:3000`

## Build de produccion

```bash
npm run build
npm run start
```

## Persistencia en Railway

- Archivos multimedia del CMS: por defecto se guardan en `/storage/media` (Linux).
- Contenido editable del CMS (`site-content.json`): por defecto se guarda en `/storage/media/cms` (Linux).
- Puedes sobrescribir rutas con variables de entorno:
  - `MEDIA_STORAGE_ROOT`
  - `CONTENT_STORAGE_ROOT`
- Recomendado: montar el volumen persistente de Railway bajo `/storage` para conservar medios y contenido entre despliegues.

## Deploy en Railway

- Como este servicio usa `Root Directory = /web/nextjs`, el despliegue se define con un `Dockerfile` dentro de esa carpeta.
- Railway detectara automaticamente ese `Dockerfile` al desplegar desde GitHub y dejara de usar Railpack para este servicio.
- En `Railway Config File`, usa la ruta absoluta del repo: `/web/nextjs/railway.json`.
- Variables de entorno sensibles como `CMS_ADMIN_TOKEN`, `CMS_ADMIN_USER`, `CMS_ADMIN_PASSWORD`, `MEDIA_STORAGE_ROOT` y `CONTENT_STORAGE_ROOT` deben configurarse en Railway, no dentro de la imagen.
- Si montas el volumen persistente en `/storage`, los uploads y el JSON del CMS sobreviviran entre despliegues.

## Estructura clave

- `app/layout.tsx`: metadata SEO y layout raiz
- `app/page.tsx`: pagina principal
- `app/en/page.tsx`: version EN para trafico internacional
- `app/globals.css`: sistema visual y responsive
- `SurfWellnessLanding.tsx`: contenido y CTAs de conversion
- `lib/analytics.ts`: helper para eventos de conversion
- `app/sitemap.ts` y `app/robots.ts`: SEO tecnico

## Notas de negocio

- WhatsApp principal: `+51 915 168 620`
- Metodo de cierre: conversacion asistida + pago por Yape/Plin
- Objetivo operativo: responder en menos de 10 minutos

## Mejoras aplicadas (siguientes pasos naturales)

1. Proyecto ejecutado en local con `npm run dev`.
2. Next.js actualizado a version parcheada para corregir vulnerabilidad reportada.
3. Ruta bilingue agregada en `/en` con metadata en ingles.
4. Eventos de analitica agregados en CTAs clave de WhatsApp.
5. SEO tecnico agregado con `robots.txt` y `sitemap.xml` generados por App Router.

## Eventos de conversion instrumentados

- `cta_whatsapp_click`
  - `placement`: `hero` | `pricing` | `final_cta` | `sticky`
  - `offer`: `plan` | `package_4` | `package_8` | `booking` | `packages`
  - `locale`: `es`
