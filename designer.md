# Designer.md - Guía de Diseño de Landing

## Vision de experiencia
La landing debe sentirse como una sesion real en Barranquito: calma, enfoque tecnico y progreso. Se debe percibir premium, local y autentica desde el primer scroll.

## Direccion visual
- Tipografia: Sora (titulos) + Manrope (texto).
- Paleta:
  - Oceano profundo: #0b2230
  - Teal energia: #1698a6
  - Arena calida: #f4e9d8
  - Sol acento: #ffbf69
- Estilo: limpio, editorial y con bloques visuales amplios.

## Arquitectura de secciones
1. Hero inmersivo
- Video de fondo corto de alumno tomando clase (mute, loop).
- Mensaje principal anti-crowd.
- CTA primario: WhatsApp.

2. Metodo en 3 pasos
- Fotos reales: preparacion, practica, feedback.
- Textos cortos y directos.

3. Prueba social
- Testimonio + foto de alumno.
- Enfocar perfiles ejecutivos y bienestar.

4. Comparativo
- Tabla Barranquito vs zonas saturadas.
- Beneficios claros: continuidad, enfoque, menor friccion.

5. Paquetes
- Cards 4 y 8 clases con ahorro visible.
- CTAs individuales por paquete a WhatsApp.

6. FAQ + cierre
- Objeciones comunes (nivel, pago, tiempo, respuesta).
- CTA final con urgencia suave.

## Especificaciones multimedia
- Hero video:
  - Formato recomendado: YouTube embed + poster fallback.
  - Duracion ideal: 15-30s.
  - Debe mostrar progreso real de alumno, no solo olas.
- Galeria:
  - 3 a 5 fotos reales comprimidas en WebP.
  - Minimo una foto de interaccion instructor-alumno.

## Patrón recomendado para YouTube en fondo
- Usar iframe con parametros de background:
  - autoplay=1
  - mute=1
  - controls=0
  - loop=1
  - playlist=VIDEO_ID
  - playsinline=1
- Overlay oscuro de 30-45% para asegurar legibilidad del copy.
- Si `prefers-reduced-motion` esta activo, ocultar autoplay y mostrar imagen estatica.

## UX de conversion
- Boton sticky permanente en mobile.
- CTA en Hero, mitad de pagina, y cierre final.
- Mensajes pre-cargados distintos por paquete.
- Refuerzo de SLA: respuesta menor a 10 min.

## Criterios de aceptacion
- Lighthouse Mobile >= 85 en Performance.
- CLS <= 0.1.
- Contraste AA en texto principal.
- Todos los CTAs de WhatsApp abren el mensaje correcto.
- La narrativa visual muestra experiencia real de escuela.
