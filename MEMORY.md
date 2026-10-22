# MEMORY.md — Civik Frontend

Memoria entre sesiones. Máximo ~50 líneas. Si algo se vuelve regla
permanente, va a `AGENTS.md` o a la skill `civik-dominio-frontend`.

## Estado actual

- `Civik-Backend` tiene las fases 0–11 completas (todos los endpoints,
  incluidos `/_health` y el listado global `GET /students`).
- Fases 0–6 **implementadas** (bootstrap 000, secciones 001, estudiantes
  002, eventos + lapsos 003, asistencia online 004, PWA + offline 005,
  notas 006). No quedan fases del "Orden de construcción". Spec 007
  (listado global de estudiantes + secciones dadas de baja) implementada
   (revisión 2026-10-13 aplicada). Spec 008 (sistema de diseño: tokens, UI
  kit, AppShell y pantalla Estudiantes de referencia) implementada; el
  cambio 2026-10-14 la dejó **solo oscura con efecto liquid glass**. El
  resto de pantallas se migra reusando el sistema.
- Suite: 132 tests verdes; `pnpm lint`, `pnpm typecheck` y `pnpm build`
  limpios (`build` genera `manifest.webmanifest` y `sw.js`).

## Decisiones (y por qué)

- Sin negocio propio: toda regla de dominio se le pide al backend. Tipos
  con el vocabulario del backend (español) para que el contrato no necesite
  capa de traducción. Ver `AGENTS.md` y `civik-dominio-frontend`.
- Stack: Vitest + Testing Library + jsdom; `VITE_API_URL` define la API
  (local `http://localhost:3000`). Gestión de lapsos vive en `EventosPage`.
- Offline: la escritura **siempre** pasa por el outbox y luego `POST
  /events/{id}/attendance/sync` (con `cambio_en`), en línea y offline: un
  solo camino con idempotencia y conflicto. El `POST /attendance` de la
  Fase 3 quedó sin usar por la UI.
- Lectura offline network-first con respaldo en Dexie (`conRespaldo`); el
  cache solo se usa sin red, nunca pisa datos frescos. La nota se muestra
  tal cual: no se recalcula ni formatea (#1).

## Aprendizajes y errores a evitar

- Usar `import.meta.env['VITE_API_URL']` (estático en Vite) para poder
  stubbear; el `queryFn` de TanStack Query v5 no puede resolver `undefined`.
- El `retry` del hook gana sobre el del QueryClient (usar `retryDelay`
  corto en tests con fallo).
- `react-hooks/set-state-in-effect` activo: sincronizar un formulario con
  `valorInicial` con `key` (remonte), no `useEffect`.
- vitest sin `globals` no limpia Testing Library: `setup.ts` con
  `afterEach(cleanup)`. `fake-indexeddb/auto` habilita Dexie en jsdom.
- vite-plugin-pwa declara `workbox-window`/`workbox-build` como **peers**:
  instalarlos como devDependencies; el plugin va `disable` en `mode === 'test'`.
- La emulación "Offline" de Chrome DevTools da falsos negativos (cuelga el
  guardado): validar offline forzando `navigator.onLine=false` con red.
- Si una vista depende de dos queries (padrón + secciones), el "Reintentar"
  debe refrescar **ambas**: una query secundaria en error es silenciosa y
  deja datos derivados (el rótulo) mal hasta una recarga completa.
- Tema: **solo oscuro** (`color-scheme: dark`, tokens en `:root`). No hay
  claro ni toggle; `index.html` fija `data-theme="dark"`. Paleta **negro +
  morado**: `--primario-rgb: 168, 85, 247` (los glows usan
  `rgba(var(--primario-rgb), …)`, no hardcodear azul), fondo negro violáceo
  `#050308`, aurora morada/fucsia/índigo, error rosa-violeta. Look "liquid
  glass": tokens `--vidrio-fondo/-borde/-desenfoque/-filtro`, `backdrop-
  filter` por componente (con `-webkit-`), y fondo con degradado para que
  el vidrio refracte. Fallback con `@supports not (backdrop-filter)` y
  `prefers-reduced-transparency`.
- Controles de formulario: `global.css` estiliza `input`/`select`/`textarea`
  (excepto checkbox/radio/range) para que **toda** pantalla, incluso las no
  migradas, tenga el mismo vidrio, foco morado con resplandor y chevron en
  selects. `TextField`/`SelectField` refinan encima (mismo look) y soportan
  `error`/`ayuda`; el error de campo lleva ícono.
- Tabs con **indicador deslizante**: `useIndicadorDeslizante` mide el
  elemento activo (`getBoundingClientRect`, `ResizeObserver`, resize,
  `document.fonts.ready`) y mueve la cápsula; usado por `SegmentedControl`
  (selector `[data-activo="true"]`, mantiene `role="group"` +
  `aria-pressed`) y por la nav de `AppShell` (selector
  `a[aria-current="page"]`). Oculto en móvil. En `jsdom` no hay
  `ResizeObserver` → se ignora.
- Errores: `Alert` con ícono por variante, barra de acento lateral y
  entrada animada (`role="alert"` en error). Los colores en línea de las
  pantallas sin migrar (Eventos/Lapsos/Notas/Asistencia/Secciones) se
  mapearon a tokens (`var(--color-*)`, `var(--vidrio-borde)`).
- Botones: **todos** los botones de la app usan el componente `Button`
  (variantes `primary`/`secondary`/`danger`, tamaños `sm`/`md`); no quedan
  `<button>` nativos sin estilos (ni en tablas ni en formularios). Se
  preservan texto/`aria-label` para los tests.
- Dropdowns: `global.css` fuerza `color-scheme: dark` en `select`/`option`
  y estiliza las opciones (fondo negro violáceo, texto claro, padding,
  `:checked` morado, `:disabled` tenue). No se cambia el `select` nativo
  por un listbox propio (rompería los tests con `selectOptions`).
- Fondo vivo (cambio 2026-10-14 b): `body::before` = aurora de degradados
  animada con `deriva` (26 s, solo `transform`, `z-index: -1`); `body::after`
  = grano SVG (`feTurbulence`) en `mix-blend-mode: overlay`. No intercepta
  clics. Los efectos de hover van bajo `@media (hover: hover)`. El borde
  especular de `Card` usa `mask-composite: exclude` (con `-webkit-mask-
  composite: xor`) y se oculta con `@supports not` si no hay soporte. El
  título de página usa `background-clip: text` con fallback sólido.
- Movimiento: solo `transform`/`opacity`. Keyframes de entrada (`subir` en
  `Card`, `entrar`/`bajar`/`aparecer` en la cáscara) con `fill-mode:
  backwards` para no pisar el `transform` del hover. `prefers-reduced-motion`
  global (con `!important`, `iteration-count: 1`) apaga todo.
- `backdrop-filter` en un ancestro crea containing block para `position:
  fixed`: en móvil la nav inferior se escapaba del viewport. Por eso el
  encabezado no lleva `backdrop-filter` en `≤640px`; el vidrio va en la
  barra inferior (que es la fija).
- CSS Modules + tokens (sin dependencias nuevas). Los componentes del
  sistema usan inputs sr-only (visibles por label): automatizar el click
  en el label, no en el input.

## Historial por fase

- 001 secciones · 002 estudiantes (por sección) · 003 eventos (lapsos +
  crear/cancelar con motivo) · 004 asistencia online.
- 005 PWA + offline: SW, caché de lectura, outbox con id de cliente, sync
  con `cambio_en`, fusión padrón+pendientes, aviso de conflicto y contador
  de pendientes en vivo con `liveQuery` (RF-12).
- 006 notas: por lapso y sección, aviso provisional/definitiva, "sin nota"
  ≠ 0, marca "Editada manualmente" si `es_override` (RF-10).
- 007 listado global: modo "Todos" en Estudiantes (`GET /students`), rótulo
  derivado cruzando `id_section` con `/sections?incluir_inactivas`, buscador
  de cliente, toggles de inactivos y de secciones dadas de baja (reactivar).
  Revisión 2026-10-13: "Reintentar" reintenta padrón **y** secciones, y el
  vacío del buscador ("sin coincidencias") es distinto del de padrón vacío.
- 008 sistema de diseño: tokens, UI kit (`components/ui/`), AppShell con
  nav inferior móvil, NotFound y Estudiantes rediseñada (labels/roles/
  textos preservados). Cambio 2026-10-14: **solo oscuro + liquid glass** en
  toda la interfaz; se eliminó el tema claro, el toggle y `useTheme`
  (suite 135 → 132). Cambio 2026-10-14 (b): **pulido visual + animaciones**
  (fondo aurora animado, grano, borde especular del vidrio, entradas
  escalonadas, sheen en botones, resaltado en filas, rebote del switch,
  latido del indicador, título con degradado). Cambio 2026-10-14 (c):
  **paleta negro+morado**, tabs con indicador deslizante, acabado global de
  inputs/selects y errores con ícono. Cambio 2026-10-14 (d): **todos los
  botones con el componente `Button`** y dropdowns nativos oscuros.
  Cambio 2026-10-14 (e): la skill de diseño pasa a **liquid glass + azul
  eléctrico** (`--signal #2E7CF6`, `--danger #FF453A` solo errores, blobs
  de fondo `--signal`/`--accent-2`, `.glass-panel` en chrome, superficie
  sólida en tablas) y se aplica **solo a Secciones** (+ chrome y UI kit);
  labels en oración. Validado en Chrome DevTools: oscuro escritorio y móvil
  375 px, `prefers-reduced-motion`/`-transparency` respetados, consola
  limpia.
