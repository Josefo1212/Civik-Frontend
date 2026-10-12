# MEMORY.md — Civik Frontend

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina
lo que ya no aporte. Si algo se vuelve regla permanente, se mueve a
`AGENTS.md` o a la skill `civik-dominio-frontend`, no se queda acá.

## Estado actual

- `Civik-Backend` tiene las fases 0–10 completas (todos los endpoints,
  incluido `/_health`); el front no debe asumir que falta API.
- Fases 0–5 **implementadas**: bootstrap, secciones (001), estudiantes
  (002), eventos + lapsos (003), asistencia online (004), PWA + offline
  (005) y notas (006). No quedan fases del "Orden de construcción".
- Suite: 92 tests verdes; `pnpm lint`, `pnpm typecheck` y `pnpm build`
  limpios (`build` genera `manifest.webmanifest` y `sw.js`).
- Validación visual con Chrome DevTools **pendiente** (no había MCP) para
  las fases 0–5.

## Decisiones (y por qué)

- Sin negocio propio: toda regla de dominio se le pide al backend. Ver
  `AGENTS.md` y la skill `civik-dominio-frontend`. Tipos de dominio con el
  vocabulario del backend (español) para que el contrato no necesite capa
  de traducción.
- Stack: Vitest + Testing Library + jsdom; `VITE_API_URL` define la API
  (local `http://localhost:3000`). Gestión de lapsos vive en `EventosPage`.
- Offline: la escritura **siempre** pasa por el outbox y luego `POST
  /events/{id}/attendance/sync` (con `cambio_en`), en línea y offline: un
  solo camino con idempotencia y conflicto. El `POST /attendance` de la
  Fase 3 quedó sin usar por la UI.
- Lectura offline network-first con respaldo en Dexie (`conRespaldo`); el
  cache solo se usa sin red, nunca pisa datos frescos (lapsos/eventos/
  padrón). La nota se muestra tal cual: no se recalcula ni formatea (#1).

## Aprendizajes y errores a evitar

- `import.meta.env.VITE_API_URL` es estático en Vite: usar
  `import.meta.env['VITE_API_URL']` para poder stubbearlo. El `queryFn` de
  TanStack Query v5 no puede resolver `undefined`.
- El `retry` del hook gana sobre el del QueryClient (usar `retryDelay`
  corto en tests con fallo).
- `react-hooks/set-state-in-effect` activo: sincronizar un formulario con
  `valorInicial` con `key` (remonte), no `useEffect`.
- vitest sin `globals` no limpia Testing Library: `setup.ts` con
  `afterEach(cleanup)`. `fake-indexeddb/auto` habilita Dexie en jsdom.
- vite-plugin-pwa declara `workbox-window`/`workbox-build` como **peers**:
  instalarlos como devDependencies o `vite build` no resuelve
  `virtual:pwa-register`; el plugin va `disable` con `mode === 'test'`.

## Próximos pasos

- Cerrar validación visual (Chrome DevTools) de las fases 0–5.
- Limitación de notas: el contrato `grades` no indica si una nota es
  override, así que no se marca "editado manualmente"; requiere que el
  backend exponga un campo (p. ej. `es_override`).

## Historial por fase

- 001 secciones · 002 estudiantes (por sección) · 003 eventos (lapsos
  mínimo + crear/cancelar con motivo) · 004 asistencia online.
- 005 PWA + offline: SW, caché de lectura, outbox con id de cliente, sync
  por evento con `cambio_en`, fusión padrón+pendientes y aviso de conflicto.
- 006 notas: por lapso y sección, aviso provisional/definitiva, "sin nota"
  ≠ 0.
