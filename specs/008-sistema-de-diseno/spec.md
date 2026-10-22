# Spec 008 — Sistema de diseño y rediseño de la interfaz

Estado: implementada

## Contexto y objetivo

La app es funcional pero la capa visual es ad-hoc: casi todos los
componentes usan `style={{ … }}` inline, `global.css` tiene ocho variables
sueltas y solo dos archivos usan CSS Modules. No hay tokens, ni estados de
hover/foco consistentes, ni tema oscuro, ni transiciones. El resultado se
siente plano, inconsistente y poco profesional, sobre todo en el teléfono,
que es donde se toma asistencia.

Objetivo: introducir un sistema de diseño (tokens + componentes base con
CSS Modules), soporte de tema claro/oscuro, y rediseñar la cáscara
(`AppShell`) y una pantalla de referencia (Estudiantes) para fijar el look.
El resto de las pantallas se migra después, reusando el sistema.

## Usuarios

- Instructor: usa la PWA en el teléfono (toma de asistencia) y en la
  laptop (administración).

## Historias de usuario

- HU-1. Como instructor, quiero que la app se vea clara y ordenada, para
  encontrar rápido lo que busco.
- HU-2. Como instructor, quiero que funcione bien en el teléfono, para no
  pelear con la pantalla al tomar asistencia.
- HU-3. Como instructor, quiero poder usar la app de noche con tema oscuro,
  para no encandilarme.

## Definiciones

- **Token**: variable CSS con un valor del sistema (color, tipografía,
  espaciado, radio, sombra, transición).
- **Componente base**: primitivo de UI reutilizable (botón, tarjeta, campo,
  insignia, …) con su propio CSS Module.
- **Pantalla de referencia**: Estudiantes, donde se aplica el sistema
  completo antes de migrar el resto.

## Requisitos funcionales

- RF-1: EL SISTEMA ofrece un tema claro y uno oscuro, siguiendo la
  preferencia del sistema (`prefers-color-scheme`) y permitiendo forzarlo
  con un control en el encabezado; la elección persiste entre sesiones.
- RF-2: EL SISTEMA define los estilos a partir de tokens (color,
  tipografía, espaciado, radios, sombras, transiciones); ningún componente
  nuevo usa `style` inline para lo que ya cubre un token.
- RF-3: EL SISTEMA provee componentes base reutilizables: botón (con
  variantes), tarjeta, campos de formulario, insignia de estado, alerta,
  estado vacío, cargador y control segmentado.
- RF-4: EL SISTEMA rediseña la cáscara (marca, navegación, estado del
  servidor, sincronización) manteniendo las mismas rutas y etiquetas; en
  móvil la navegación pasa a una barra inferior.
- RF-5: EL SISTEMA rediseña la pantalla Estudiantes (modos "Por sección" y
  "Todos", buscador, toggles, tablas, alertas y estados vacíos) con el
  sistema, sin cambiar su comportamiento ni sus nombres accesibles.
- RF-6: EL SISTEMA anima las interacciones (hover, foco/foco-visible,
  aparición de contenido, cambio de tema, control segmentado), usando solo
  `transform`/`opacity` y propiedades declaradas — nunca `transition: all`.
- RF-7: SI el usuario tiene activado "reducir movimiento"
  (`prefers-reduced-motion: reduce`), ENTONCES EL SISTEMA desactiva las
  animaciones y transiciones no esenciales.

## Requisitos no funcionales

- RNF-1: Contraste AA en ambos temas para texto y controles.
- RNF-2: Foco visible (`:focus-visible`) en todo elemento interactivo.
- RNF-3: Sin regresión funcional: los RF de las specs 001–007 y sus tests
  siguen verdes; no se toca la lógica de negocio ni la de sincronización.
- RNF-4: Nombres accesibles (roles, labels, `aria-label`) intactos: los
  tests de páginas y componentes siguen pasando sin cambios.
- RNF-5: Funciona offline (sin dependencias que requieran red); `color-scheme`
  y el `theme-color` acompañan al tema.
- RNF-6: Convención del repo: funciones flecha, `import type`, sin `any`,
  export por defecto y con nombre; textos de interfaz en español.

## Casos límite

- Preferencia de tema sin elegir: se usa la del sistema y se sigue si el
  sistema cambia.
- `localStorage` no disponible: la app no rompe; cae a la preferencia del
  sistema.
- Contenido largo (nombres, teléfonos): trunca o envuelve sin romper el
  layout.
- Tabla en móvil: desplazamiento horizontal sin desbordar la página.
- Lista vacía y búsqueda sin resultados: estados vacíos distintos (spec
  007), ahora con el componente de estado vacío.

## Fuera de alcance

- Rediseño de las pantallas Secciones, Eventos, Asistencia y Notas (van en
  iteraciones siguientes, reusando el sistema).
- Cambios de lógica, de datos, de sync/outbox/Dexie o de la constitución.
- Internacionalización o cambio de idioma.
- Librerías de UI o de CSS externas (se mantiene CSS Modules).

## Criterios de finalización

- Tokens claro/oscuro, componentes base, `AppShell` y pantalla Estudiantes
  rediseñados.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes, sin
  romper los tests existentes.
- Validación visual con Chrome DevTools en claro, oscuro y móvil (375 px).
- `MEMORY.md` actualizado.

## Dudas abiertas

Resueltas en la clarificación del 2026-10-13:

- **Enfoque**: CSS Modules + tokens, sin dependencias nuevas.
- **Tema**: claro y oscuro.
- **Alcance de la primera entrega**: sistema + `AppShell` + pantalla
  Estudiantes; después se migra el resto.

## Cambio 2026-10-14 — Tema oscuro único + Liquid Glass

Aprobado por el usuario sobre la entrega anterior. Reemplaza RF-1 y suma
RF-8 y RF-9.

- RF-1 (reemplazado): EL SISTEMA usa un único tema oscuro. No hay tema
  claro, ni control de tema, ni preferencia del sistema.
- RF-8: EL SISTEMA aplica un material "liquid glass" (superficies
  translúcidas con desenfoque y saturación del fondo) a toda la interfaz:
  cáscara, navegación, tarjetas, botones, insignias, alertas, campos,
  control segmentado y tablas.
- RF-9: SI el navegador no soporta `backdrop-filter` o el usuario pide
  menos transparencia, ENTONCES EL SISTEMA cae a superficies opacas
  legibles.

Criterios de finalización del cambio: los cuatro comandos verdes, la
validación visual en oscuro y móvil (375 px), y `MEMORY.md` actualizado.
El tema claro y sus tokens se eliminan (no se conserva el mecanismo).

## Cambio 2026-10-14 (b) — Pulido visual y animaciones

Aprobado por el usuario sobre la entrega anterior ("se ve muy simple").
Suma RF-10 y RF-11; refuerza RF-8.

- RF-10: EL SISTEMA muestra un fondo vivo: aurora de degradados
  (azul/violeta/cian) que deriva lentamente detrás del contenido más una
  capa de grano sutil. El fondo no intercepta la interacción.
- RF-11: EL SISTEMA da movimiento a la interfaz: entrada escalonada de
  tarjetas y páginas (fundido + desplazamiento), elevación y brillo
  (sheen) al pasar el mouse por botones, resaltado lateral en filas de
  tabla, rebote en el control de interruptor y latido en el indicador de
  servidor.
- RF-8 (refuerzo): el vidrio gana un borde degradado especular (borde de
  1 px de luz) y un brillo superior interno en tarjetas, tablas, campos
  y cáscara.

Restricciones del cambio:

- Todo el movimiento usa solo `transform`/`opacity` (compositor).
- NFR: con `prefers-reduced-motion: reduce` se desactiva todo el
  movimiento y la animación del fondo (ya cubierto por la regla global).
- Los efectos de hover se aplican solo en dispositivos con `hover: hover`
  para no dejar estados pegados en pantallas táctiles.
- El borde especular usa `mask-composite`; si no se soporta, se oculta.
- Si el navegador no soporta `background-clip: text`, el título de página
  pierde el degradado pero mantiene color sólido legible.

Criterios de finalización del cambio: los cuatro comandos verdes,
validación visual en escritorio y móvil (375 px), consola sin errores y
`MEMORY.md` actualizado.

## Cambio 2026-10-14 (c) — Paleta negro+morado, tabs deslizantes, inputs y errores

Aprobado por el usuario ("usa una paleta negro y morado", "cada input,
cada lista desplegable, mejor acabado", "que pasar entre pestañas sea un
componente tab y que el indicador se deslice suave", "mejorá mostrar
errores"). Suma RF-12 a RF-15.

- RF-12: EL SISTEMA usa una paleta negro + morado. El color primario es
  morado (token `--primario-rgb`), el fondo es negro violáceo y la aurora
  es morada/fucsia/índigo (sin azul ni cian). El color de error pasa a
  rosa-violeta (`--color-error`).
- RF-13: TODOS los controles de formulario (inputs, selects, textareas),
  incluso los que no usan un componente del UI kit, tienen el mismo
  acabado de vidrio (fondo translúcido, borde, relieve, foco morado con
  resplandor). Los selects llevan chevron propio.
- RF-14: EL SISTEMA tiene un componente de pestañas con indicador
  deslizante: la cápsula activa se **desplaza** suavemente entre pestañas
  (no aparece/desaparece). Se aplica al `SegmentedControl` y a la
  navegación principal.
- RF-15: EL SISTEMA muestra los errores con ícono, barra de acento
  lateral y entrada animada; los errores de campo llevan ícono propio.
  `Alert` pasa a ser `role="alert"` con contenido legible.

Restricciones del cambio:

- Se preservan los contratos accesibles existentes (`role="group"` +
  `aria-pressed` del `SegmentedControl`; `role="alert"` de `Alert`; los
  `aria-label` de todos los campos).
- El indicador deslizante mide el elemento activo con
  `getBoundingClientRect`, se reposiciona con `ResizeObserver`, al
  redimensionar y cuando cargan las fuentes; en móvil se oculta. En
  `jsdom` (tests) no rompe: si no hay `ResizeObserver`, no lo usa.
- Los colores en línea de las pantallas aún no migradas se mapean a los
  tokens (sin cambiar la estructura ni los textos).

Criterios de finalización del cambio: los cuatro comandos verdes,
validación visual en escritorio y móvil (375 px), consola sin errores y
`MEMORY.md` actualizado.

## Cambio 2026-10-14 (d) — Botones del UI kit en todas partes y dropdowns oscuros

Aprobado por el usuario ("los botones de guardar, crear lapso siguen
viéndose mal, mejorálos", "cuando despliego la lista de grado no me gusta
cómo se ve, mejorala"). Suma RF-16 y RF-17.

- RF-16: TODOS los botones de la aplicación usan el componente `Button`
  del UI kit (o el `button` estilizado del `SegmentedControl`), con sus
  variantes y tamaños; no queda ningún `<button>` nativo sin estilos —
  incluye los de guardar/crear de los formularios y los de acción de las
  tablas (Editar, Dar de baja, Reactivar, Eliminar, Activar, Cerrar,
  Cancelar, Confirmar, Deshacer, Cancelar edición).
- RF-17: las listas desplegables (`select`) se ven oscuras y coherentes:
  `color-scheme: dark` en el select y sus opciones, opciones con fondo
  negro violáceo, texto claro, padding y opción seleccionada/deshabilitada
  diferenciadas.

Restricciones del cambio:

- Se preservan los nombres accesibles de todos los botones (texto o
  `aria-label`) y los roles (`combobox`, `button`); los tests que usan
  `getByRole('button', { name })` y `selectOptions` no cambian.
- No se reemplaza el `select` nativo por un listbox propio (rompería las
  pruebas de integración y la accesibilidad nativa); solo se estiliza lo
  que la plataforma permite.

Criterios de finalización del cambio: los cuatro comandos verdes,
validación visual en escritorio y móvil (375 px), consola sin errores y
`MEMORY.md` actualizado.

## Cambio 2026-10-14 (e) — Liquid glass + azul eléctrico, aplicado a Secciones

Aprobado por el usuario ("Lee la skill design-system (actualizada:
dirección liquid glass, azul eléctrico como acento). Aplícala a
Secciones"). Suma RF-18 a RF-23. La skill
`.opencode/skills/design-system/SKILL.md` se reescribió con esta dirección
y es la referencia vigente.

- RF-18: fondo de la app con dos blobs difusos fijos (`--signal` y
  `--accent-2`), `blur(120px)`, opacidad baja y deriva muy lenta
  (20-30 s, `ease-in-out`, loop) detrás del contenido.
- RF-19: el chrome (barra de navegación, paneles de formulario, tarjetas)
  usa el material `.glass-panel`: fondo translúcido, `backdrop-filter:
  blur(20px) saturate(160%)`, borde claro, filo superior iluminado, sombra
  de flotación y radio 16-20 px.
- RF-20: las tablas de datos van sobre superficie sólida `--surface` (radio
  8 px), SIN vidrio por fila; los datos numéricos/fechas en `IBM Plex Mono`
  con `tabular-nums`.
- RF-21: los labels de la interfaz van en minúscula/oración ("Grado", no
  "GRADO"); se prohíbe `text-transform: uppercase` como decoración.
- RF-22: `--signal` (azul eléctrico) es el único acento de acción (botón
  primario, tab activo, foco); `--danger` (rojo) queda exclusivo de errores
  reales y nunca se reutiliza como acento de marca.
- RF-23: motion orquestado: indicador de nav que desliza (~200 ms,
  `ease-out`), `scale(0.97)` al presionar el botón primario, un solo reveal
  de entrada por panel; `prefers-reduced-motion` congela la deriva y el
  reveal, y `prefers-reduced-transparency` hace caer `.glass-panel` a
  `--surface` sólido sin `backdrop-filter`.

Alcance de este cambio: solo la pantalla de **Secciones** (y el chrome
compartido: `AppShell`, UI kit y tokens globales). Las demás pantallas no
se tocan; heredan los tokens al re-tokenizar `global.css`.

Restricciones del cambio:

- Se preservan los nombres accesibles y roles que usan los tests
  (`aria-label` de form/campos/botón, `role="alert"`, `role="group"`/
  `aria-pressed`); la suite no cambia.
- No se introduce un listbox propio: el `select` nativo se estiliza.
- No se toca la lógica de negocio, sync, outbox ni Dexie.

Criterios de finalización del cambio: los cuatro comandos verdes,
validación visual en escritorio y móvil (375 px) con consola limpia,
verificación de las dos media queries (`prefers-reduced-motion` y
`prefers-reduced-transparency`) y `MEMORY.md` actualizado.
