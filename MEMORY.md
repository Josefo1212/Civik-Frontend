# MEMORY.md — Civik Frontend

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina
lo que ya no aporte. Si algo se vuelve regla permanente, se mueve a
`AGENTS.md` o a la skill `civik-dominio-frontend`, no se queda acá.

## Estado actual

- `Civik-Backend` tiene las fases 0–10 completas (todos los endpoints
  listos, incluido `/_health`); el front no debe asumir que falta API.
- Fases 0–3 **implementadas**: bootstrap, secciones (001), estudiantes
  (002), eventos + lapsos mínimos (003) y asistencia online (004).
- Suite: 57 tests verdes; `pnpm lint`, `pnpm typecheck` y `pnpm build`
  limpios.
- Validación visual con Chrome DevTools **pendiente** (no había MCP de
  DevTools en la sesión) para las fases 0–3.

## Decisiones (y por qué)

- Sin negocio propio: toda regla de dominio se le pide al backend. Ver
  `AGENTS.md` y la skill `civik-dominio-frontend`.
- Tipos de dominio con el vocabulario del backend (español) para que el
  contrato de API no necesite traducción.
- Stack: Vitest + Testing Library + jsdom; `VITE_API_URL` define la API
  (local `http://localhost:3000`).
- Gestión de lapsos vive dentro de `EventosPage` (no hay ruta nueva).

## Aprendizajes y errores a evitar

- `import.meta.env.VITE_API_URL` se reemplaza estáticamente por Vite y no
  se puede stubbear en tests; usar `import.meta.env['VITE_API_URL']`.
- En TanStack Query v5 el `queryFn` no puede resolver `undefined`.
- El `retry` del hook gana sobre el del QueryClient: en tests con fallo,
  `retryDelay` corto (250 ms) evita que el `waitFor` expire.
- `react-hooks/set-state-in-effect` está activo: para sincronizar un
  formulario con `valorInicial` se usa `key` (remonte), no `useEffect`.
- vitest sin `globals` no hace cleanup de Testing Library: `src/test/setup.ts`
  lo hace con `afterEach(cleanup)`.

## Próximos pasos

- Cerrar validación visual (Chrome DevTools) de las fases 0–3.
- Fase 4: PWA + offline (service worker, outbox Dexie, sincronización).
  La Fase 9 del backend ya expone `POST /events/{id}/attendance/sync`.

## Historial por fase

- 001 secciones: CRUD, filtro, baja/reactivar con deshacer en sesión.
- 002 estudiantes: por sección (selector obligatorio), toggle inactivos,
  alta/edición/baja/reactivar.
- 003 eventos: lapsos mínimo (listar/crear/activar/cerrar) + eventos
  (listar por lapso, crear manual, cancelar con motivo).
- 004 asistencia online: padrón del evento, marcado masivo y guardado en
  lote (upsert); "Sin marcar" ≠ ausente; sin offline todavía.

## Correcciones aplicadas (Fase 1)

- Los formularios usaban `value` con `onChange={() => {}}` (solo-lectura):
  se les dio estado interno y `key` para remontar.
- `src/test/setup.ts` hace `cleanup` en `afterEach`.
