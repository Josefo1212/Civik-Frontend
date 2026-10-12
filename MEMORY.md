# MEMORY.md — Civik Frontend

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina
lo que ya no aporte. Si algo se vuelve regla permanente, se mueve a
`AGENTS.md` o a la skill `civik-dominio-frontend`, no se queda acá.

## Estado actual

- `Civik-Backend` tiene las fases 0–10 completas (todos los endpoints,
  incluido `/_health`); el front no debe asumir que falta API.
- Fases 0–4 **implementadas**: bootstrap, secciones (001), estudiantes
  (002), eventos + lapsos (003), asistencia online (004) y PWA + offline
  (005).
- Suite: 81 tests verdes; `pnpm lint`, `pnpm typecheck` y `pnpm build`
  limpios. `pnpm build` genera `manifest.webmanifest` y `sw.js`.
- Validación visual con Chrome DevTools **pendiente** (no había MCP de
  DevTools en la sesión) para las fases 0–4.

## Decisiones (y por qué)

- Sin negocio propio: toda regla de dominio se le pide al backend. Ver
  `AGENTS.md` y la skill `civik-dominio-frontend`.
- Tipos de dominio con el vocabulario del backend (español) para que el
  contrato de API no necesite traducción.
- Stack: Vitest + Testing Library + jsdom; `VITE_API_URL` define la API
  (local `http://localhost:3000`). Gestión de lapsos vive en `EventosPage`.
- Offline: la escritura **siempre** pasa por el outbox y luego
  `POST /events/{id}/attendance/sync` (con `cambio_en`), en línea y
  offline: un solo camino con idempotencia y conflicto. El `POST
  /attendance` de la Fase 3 quedó sin usar por la UI.
- Lectura offline network-first con respaldo en Dexie (`conRespaldo`); el
  cache solo se usa sin red, nunca pisa datos frescos. Se cachean
  lapsos/eventos/padrón (decisión de alcance acordada con el usuario).

## Aprendizajes y errores a evitar

- `import.meta.env.VITE_API_URL` es estático en Vite: usar
  `import.meta.env['VITE_API_URL']` para poder stubbearlo.
- El `queryFn` de TanStack Query v5 no puede resolver `undefined`; el
  `retry` del hook gana sobre el del QueryClient (usar `retryDelay` corto
  en tests con fallo).
- `react-hooks/set-state-in-effect` activo: sincronizar un formulario con
  `valorInicial` con `key` (remonte), no `useEffect`.
- vitest sin `globals` no limpia Testing Library: `setup.ts` con
  `afterEach(cleanup)`. `fake-indexeddb/auto` habilita Dexie en jsdom
  (limpiar tablas en `beforeEach`).
- vite-plugin-pwa declara `workbox-window`/`workbox-build` como **peers**:
  instalarlos como devDependencies o `vite build` no resuelve
  `virtual:pwa-register`; el plugin va `disable` con `mode === 'test'`.

## Próximos pasos

- Cerrar validación visual (Chrome DevTools) de las fases 0–4.
- Fase 5: notas (vista por lapso y sección, con aviso de "provisional");
  el backend ya expone las notas (spec 008).

## Historial por fase

- 001 secciones · 002 estudiantes (por sección, toggle inactivos) ·
  003 eventos (lapsos mínimo + crear/cancelar con motivo).
- 004 asistencia online: padrón por evento, marcado masivo en lote,
  "Sin marcar" ≠ ausente.
- 005 PWA + offline: service worker, caché de lectura, outbox con id de
  cliente, sync por evento con `cambio_en`, fusión padrón+pendientes,
  botón/contador de sincronización y aviso de conflicto.
