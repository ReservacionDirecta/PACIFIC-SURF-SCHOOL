# UI/UX Skills Playbook

## Objetivo
Definir un sistema de trabajo para mejorar la landing de Pacific Surf School con una experiencia completa, visual y de alto rendimiento para mobile-first.

## Cuando usar este playbook
- Mejorar conversion de landing pages.
- Disenar secciones con video/foto para mostrar experiencia real de alumnos.
- Revisar fricciones de UI/UX en reservas por WhatsApp.
- Preparar entregables listos para implementacion en Next.js.

## Principios de diseno
- Claridad antes que decoracion: cada bloque debe tener una accion concreta.
- Prueba social real: fotos y clips de sesiones reales, no stock generico.
- Conversion sin friccion: CTA persistente a WhatsApp y rutas de paquete 4/8.
- Rendimiento primero: multimedia optimizada para no romper Core Web Vitals.
- Accesibilidad: contraste alto, subtitulos y control de movimiento.

## Flujo UX recomendado
1. Captura de atencion: hero con promesa anti-crowd de Barranquito.
2. Validacion: evidencia visual del metodo y testimonios.
3. Comparacion: Barranquito vs zonas saturadas.
4. Decision: paquetes claros (4 y 8 clases) con ahorro visible.
5. Cierre: CTA a WhatsApp con mensaje precargado y pago Yape/Plin.

## Estrategia multimedia por seccion
- Hero: video corto de alumno en clase (6 a 12 segundos, loop suave, sin audio).
- Metodo: secuencia de 3 fotos (briefing en arena, practica en agua, feedback).
- Testimonios: foto real + cita corta de alumno.
- Paquetes: micro-video o foto contextual por paquete.
- CTA final: imagen emocional de cierre (atardecer + alumno sonriendo).

## Uso de YouTube como video de fondo
Puedes subir videos a YouTube y usar embed en secciones clave con estas reglas:
- Usa videos horizontales de 1080p, 15 a 30 segundos, sin musica con copyright.
- Publica como Unlisted si no quieres indexacion publica.
- Parametros recomendados para fondo:
  - `autoplay=1`
  - `mute=1`
  - `loop=1`
  - `playlist=<VIDEO_ID>`
  - `controls=0`
  - `modestbranding=1`
  - `playsinline=1`
  - `rel=0`
- Siempre agrega fallback:
  - Poster image para carga lenta
  - Version estatica para `prefers-reduced-motion`

## Guardrails tecnicos
- LCP objetivo: <= 2.5s en 4G.
- Tamaño maximo de imagen hero: <= 250 KB (WebP/AVIF).
- Lazy load en multimedia fuera del primer viewport.
- Evitar multiples videos autoplay simultaneos.

## Checklist de calidad UI/UX
- El usuario entiende propuesta de valor en menos de 5 segundos.
- Existe CTA visible sin scroll en mobile.
- Comparativo Barranquito vs saturacion esta presente y claro.
- Hay evidencia visual real de alumnos e instructores.
- El embudo a WhatsApp funciona en todos los botones.
- La pagina se ve bien en 360px, 768px y 1440px.
