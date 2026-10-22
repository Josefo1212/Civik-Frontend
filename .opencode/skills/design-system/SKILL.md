---
name: design-system
description: Úsala siempre que crees o modifiques cualquier pantalla, componente visual o estilo de Civik Frontend. Define la paleta, materiales (liquid glass), tipografía, layout, motion y patrones de componentes — es la referencia de diseño del proyecto, no se reinventa por pantalla.
---

# Sistema de diseño — Civik

Dirección: **liquid glass** (el lenguaje de materiales translúcidos de
iOS), aplicado con criterio profesional sobre el contenido real de
Civik — un padrón, una planilla de asistencia, una planilla de notas.
Llamativo en el chrome (navegación, paneles, botones), sobrio y
perfectamente legible en los datos (tablas, números, fechas).

**Regla de oro: el vidrio es para contenedores, no para datos repetidos.**
Un panel de "Crear sección" puede ser vidrio. Una fila de una tabla de 40
estudiantes, no — ahí el blur compite con la lectura de la nota de cada
uno.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0B0F17` | lienzo de fondo — donde viven los degradados difusos |
| `--surface` | `#171D24` | superficie sólida: filas de tabla, inputs, zonas de lectura densa |
| `--line` | `rgba(255,255,255,0.10)` | bordes sobre vidrio y sobre superficie sólida |
| `--ink` | `#F2F5F8` | texto principal |
| `--ink-muted` | `#9AA5B1` | texto secundario, placeholders |
| `--signal` | `#2E7CF6` | **único acento de acción** — azul eléctrico: botones primarios, tab activo, foco |
| `--signal-glow` | `#6FA8FF` | brillo especular / resplandor de --signal, nunca como color plano |
| `--accent-2` | `#34D1C4` | dato de referencia / secundario (enlaces, info) — nunca para acciones |
| `--ok` | `#32D74B` | positivo: presente, sincronizado, aprobado |
| `--danger` | `#FF453A` | **exclusivo para errores reales** — nunca se reutiliza como acento de marca |

`--signal` y `--danger` nunca se mezclan: si un botón es rojo, el usuario
debe poder asumir que es destructivo o que algo falló. Mantener esa
semántica es más importante que la estética.

## Material: vidrio esmerilado (glass)

Tokens de la superficie de vidrio, para navegación, modales, tarjetas de
formulario (no para filas de tabla):

```css
--glass-bg: rgba(23, 29, 36, 0.55);
--glass-blur: blur(20px) saturate(160%);
--glass-border: 1px solid rgba(255, 255, 255, 0.12);
--glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.15); /* filo superior iluminado */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.35); /* profundidad, flotación */
```

```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  box-shadow: var(--glass-shadow), var(--glass-highlight);
  border-radius: 20px; /* vidrio = esquinas suaves tipo "squircle", no 4px */
}
```

**Límite de rendimiento:** máximo 2 capas de `backdrop-filter` activas a
la vez en pantalla (ej. nav + un modal). Nunca aplicar vidrio a cada
elemento de una lista repetida.

### Fondo "liquid"

El efecto de color que se filtra a través del vidrio viene de 2-3 formas
de color difuminadas, fijas detrás del contenido, no del vidrio en sí:

```css
.bg-blobs::before, .bg-blobs::after {
  content: "";
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}
.bg-blobs::before { background: var(--signal); width: 480px; height: 480px; top: -100px; left: -80px; }
.bg-blobs::after  { background: var(--accent-2); width: 400px; height: 400px; bottom: -120px; right: -60px; }
```

Deriva muy lenta (20-30s, `ease-in-out`, loop) — ambiental, nunca
distrae. Se congela con `prefers-reduced-motion`.

## Tipografía (sin cambios de dirección anterior)

- **UI y encabezados**: `Space Grotesk`.
- **Todo número o fecha**: `IBM Plex Mono`, `font-variant-numeric:
  tabular-nums`. Notas, fechas, conteos, años escolares, cédulas.
- **Formularios y párrafos**: `Inter`.
- **Mayúsculas prohibidas como estilo de label.** "Grado", "Subdivisión",
  "Turno", "Crear sección" en minúscula/oración — nunca
  `text-transform: uppercase` como decoración.

## Layout

- Contenedores de formulario / navegación / modales → `.glass-panel`.
- Tablas de datos (listado de secciones, estudiantes, asistencia, notas)
  → superficie sólida `--surface`, filas con `--line` como regla
  divisoria, SIN vidrio por fila.
- Radios: vidrio = 16-20px (squircle). Superficie sólida (inputs, filas)
  = 8px. No mezclar los dos radios en el mismo tipo de elemento.

## Motion

Un momento orquestado por interacción, no efectos repetidos en cada
elemento:

- **Nav activa**: el indicador desliza hacia el tab activo (layout
  animation, ~200ms, `ease-out`) en vez de cambiar de color de golpe.
- **Botón primario**: leve `scale(0.97)` al presionar — feedback táctil,
  no hover decorativo.
- **Entrada de panel/modal**: un solo reveal (`opacity` + `scale` de 0.98
  a 1, ~250ms) al aparecer. Nada de fade-slide-up escalonado por cada
  tarjeta — eso es el default genérico que estamos evitando.
- **Fondo**: deriva lenta y continua de los blobs (ver arriba).

`@media (prefers-reduced-motion: reduce)`: desactivar la deriva del
fondo y el scale de entrada; conservar solo fades de opacidad.
`@media (prefers-reduced-transparency: reduce)`: `.glass-panel` cae a
`background: var(--surface)` sólido, sin `backdrop-filter`.

## Patrones de componentes

**Estado** (asistencia, sincronización, eventos): marcador cuadrado o
romboidal de 8px + texto. Nunca solo color — alguien con daltonismo debe
distinguir presente/ausente sin depender del tono.

**Estados vacíos**: voz directa de tablero de estado ("Todavía no hay
lapsos para tomar asistencia"). Sin mascotas ni emojis.

**Errores**: `--danger`, explican qué pasó y qué hacer. Nunca el texto
técnico crudo del error de red/parseo — eso va a consola, no a pantalla.

**Franja de sincronización**: persistente, no solo un badge. `--signal`
si hay ítems pendientes en el outbox (con el conteo), `--ok` si todo está
sincronizado, `--danger` solo si falló de verdad (no simplemente
"offline", que es un estado esperado de la app).

## Principios

1. Vidrio en el chrome, superficie sólida en los datos repetidos.
2. `--signal` (azul) = acción. `--danger` (rojo) = error/destructivo.
   Nunca se confunden.
3. Un momento de motion por interacción, no efectos en cada hover.
4. Todo número/fecha en monoespaciada tabular, siempre.
5. Antes de dar una pantalla por terminada: 375px de ancho, foco de
   teclado visible, `prefers-reduced-motion` y `prefers-reduced-
   transparency` respetados, contraste de texto verificado sobre la
   zona más ocupada del fondo difuminado.
