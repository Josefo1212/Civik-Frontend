# MEMORY.md — Civik Frontend

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina
lo que ya no aporte. Si algo se vuelve regla permanente, se mueve a
`AGENTS.md` o a la skill `civik-dominio-frontend`, no se queda acá.

## Estado actual

- `Civik-Backend` tiene las fases 0–10 completas (todos los endpoints
  listos, incluido `/_health`); el front no debe asumir que falta API.
- Fase 0 (Bootstrap) **implementada** (spec `specs/000-bootstrap/`):
  shell navegable, router (`createBrowserRouter`), cliente HTTP y estado
  de conectividad. Suite: 10 tests verdes; `pnpm lint`, `pnpm typecheck`
  y `pnpm build` limpios.
- Validación visual con Chrome DevTools de la Fase 0 **pendiente** (no
  había MCP de DevTools en la sesión): navegar las 5 rutas + 404 y ver
  el estado del servidor caído/levantado.

## Decisiones (y por qué)

- Sin negocio propio: toda regla de dominio se le pide al backend. Ver
  `AGENTS.md` y la skill `civik-dominio-frontend`.
- Los tipos de dominio usan el mismo vocabulario en español que el
  backend, para que el contrato de API no necesite traducción.
- Stack confirmado: Vitest + Testing Library + jsdom; estilos con CSS
  Modules + tokens en `styles/global.css`. `VITE_API_URL` define la API;
  en local `http://localhost:3000`.

## Aprendizajes y errores a evitar

- `import.meta.env.VITE_API_URL` se reemplaza estáticamente por Vite y no
  se puede stubbear en tests; usar `import.meta.env['VITE_API_URL']`.
- En TanStack Query v5 el `queryFn` no puede resolver `undefined`;
  `fetchHealth` devuelve `true`.
- El `retry` del hook gana sobre el default del QueryClient: para tests
  con fallo, `retryDelay` corto (250 ms) evita que el `waitFor` expire.

## Próximos pasos

- Cerrar la validación visual de la Fase 0 (Chrome DevTools).
- Fase 1: administración de secciones (001) implementada. Siguiente: 002
  estudiantes (por sección; vista "todos juntos" pendiente hasta que el
  backend exponga `GET /students` con `incluir_inactivas`).

## 001-secciones (implementada)
- api/client ampliado (error del body, apiSend)
- tipo Seccion, constantes, api+hooks+componentes + página
- baja/reactivar con deshacer en sesión (estado local)
- build/lint/typecheck/tests verdes

## 002-estudiantes (implementada)
- dominio Estudiante, api, hooks, SelectorSeccion, FormularioEstudiante, TablaEstudiantes + toggle inactivos
- page por sección (obligatorio); edición permite cambiar sección
- build/lint/typecheck/tests verdes (34 tests)
