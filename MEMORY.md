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
  claro ni toggle; `index.html` fija `data-theme="dark"`. Look "liquid
  glass": tokens `--vidrio-fondo/-borde/-desenfoque`, `backdrop-filter:
  blur() saturate()` por componente (con `-webkit-`), y fondo con degradado
  para que el vidrio refracte. Fallback con `@supports not
  (backdrop-filter)` y `prefers-reduced-transparency`.
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
  (suite 135 → 132). Validado en Chrome DevTools: oscuro escritorio y móvil
  375 px, consola limpia.
