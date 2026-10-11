# Plan 000 — Bootstrap

Spec: `spec.md` (aprobada). Cubre RF-1 … RF-7.

## Alcance

Esqueleto navegable + cliente HTTP mínimo + comprobación de conectividad
contra `/_health`. Sin PWA, sin Dexie/outbox, sin lógica de dominio.
La instalación de dependencias se hace con **pnpm** (ya hay
`pnpm-lock.yaml`).

## Dependencias

Producción: `react-router-dom`, `@tanstack/react-query`.
Desarrollo: `vitest`, `jsdom`, `@testing-library/react`,
`@testing-library/jest-dom`, `@testing-library/user-event`.

`vite-plugin-pwa` y `dexie` **no** se instalan en esta fase (fases 4).

## Archivos que se crean

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/api/client.ts` | `apiFetch` (a base, JSON, timeout, lanza `ApiError`). Lee `VITE_API_URL` | RF-7 |
| `src/api/health.ts` | `fetchHealth()` → llama `/_health`, resuelve si `res.ok`, lanza si no | RF-4, RF-6 |
| `src/hooks/useServerStatus.ts` | `useQuery` sobre `fetchHealth`; deriva `'loading' \| 'online' \| 'offline'` | RF-4, RF-5, RF-6 |
| `src/components/AppShell/AppShell.tsx` (+ `.module.css`) | Layout: encabezado, nav a las 5 secciones, indicador de estado, `<Outlet/>` | RF-1, RF-2 |
| `src/components/ServerStatus/ServerStatus.tsx` (+ `.module.css`) | Muestra el estado de conectividad (cargando / disponible / no disponible) | RF-4, RF-5, RF-6 |
| `src/components/NotFound/NotFound.tsx` | Pantalla de ruta no encontrada | RF-3 |
| `src/pages/{SeccionesPage,EstudiantesPage,EventosPage,AsistenciaPage,NotasPage}/index.tsx` | Componente de página placeholder, sin lógica | RF-2 |
| `src/app/router.tsx` | `createBrowserRouter`: AppShell como layout, 5 rutas + `*` → NotFound | RF-1, RF-2, RF-3 |
| `src/app/providers.tsx` | `QueryClientProvider` (QueryClient único por app) | RF-4 |
| `src/styles/global.css` | Reset + tokens (colores, espaciado, tipografía) | RNF-2 |
| `src/vite-env.d.ts` (amplía) | Tipar `ImportMetaEnv.VITE_API_URL` | RF-7 |
| `src/constants/routes.ts` | Rutas y etiquetas de navegación en un solo lugar | RF-1 |
| `.env.example` | Documenta `VITE_API_URL` | RF-7 |
| `src/api/client.test.ts` | Tests de `apiFetch` / `fetchHealth` | RF-4, RF-6, RF-7 |
| `src/hooks/useServerStatus.test.tsx` | Tests del estado derivado | RF-5, RF-6 |

## Archivos que se modifican

| Archivo | Cambio | RF |
|---|---|---|
| `src/main.tsx` | Montar `providers` + `RouterProvider` en vez de `App` | RF-1, RF-4 |
| `index.html` | `lang="es"`, `<title>`, viewport | RNF-1, RNF-2 |
| `vite.config.ts` | Bloque `test` (jsdom, setup de jest-dom) | tests |
| `tsconfig.app.json` | Incluir tipos de test cuando aplique | tests |
| `package.json` | Scripts `test`, `test:run`, `typecheck`; dependencias | — |
| `eslint.config.js` | Ignorar `coverage`, permitir globals de test | tests |

## Archivos que se eliminan

`src/App.tsx`, `src/App.css`, `src/assets/hero.png`, `react.svg`,
`vite.svg`, `public/icons.svg` (restos del template de Vite).

## Estructura objetivo (según `AGENTS.md`)

```
src/
├── main.tsx
├── app/{App.tsx→shell queda en components, router.tsx, providers.tsx}
├── pages/{SeccionesPage,EstudiantesPage,EventosPage,AsistenciaPage,NotasPage}
├── components/{AppShell, ServerStatus, NotFound}
├── api/{client.ts, health.ts}
├── hooks/useServerStatus.ts
├── constants/routes.ts
├── styles/global.css
└── vite-env.d.ts
```

`features/`, `domain/`, `sync/`, `context/`, `utils/` no se crean todavía:
solo cuando haya código real (regla de `AGENTS.md`).

## Estado de UI

- **Estado de servidor** → TanStack Query (`useServerStatus`), con
  `staleTime` corto y reintentos acotados; no es estado local.
- **Navegación / ruta activa** → React Router (deriva de la URL).
- No se toca el outbox ni la sincronización en esta fase.

## Decisiones técnicas (y alternativa descartada)

- **`createBrowserRouter` (data router)** en vez de `<BrowserRouter>`
  declarativo: habilita loaders y code-splitting por ruta en fases
  futuras. Requiere fallback SPA en el hosting (Vercel rewrite a
  `index.html`) — se anota para el deploy.
- **`fetch` nativo envuelto en `apiFetch`** en vez de axios: sin
  dependencia extra; el backend es REST simple.
- **Estado de conectividad vía consulta real a `/_health`** en vez de
  `navigator.onLine`: `onLine` solo dice si hay red, no si el backend
  responde (con CORS/Tailscale la diferencia importa).
- **CSS Modules por componente + tokens globales** en vez de CSS plano
  global: evita colisiones de clases sin sumar Tailwind. (Elegido por el
  usuario.)
- **Tests con `fetch` simulado (`vi.stubGlobal`)** en vez de MSW: menos
  infraestructura para el único endpoint de esta fase; MSW se reevalúa
  cuando haya más superficie de API.
- **`VITE_API_URL` desde entorno** (`http://localhost:3000` en local,
  dominio Tailscale en prod) en vez de constante en código: permite
  apuntar al backend local sin recompilar lógica.

## Estrategia de tests

- `client.test.ts`: `apiFetch` arma la URL con `VITE_API_URL`, parsea
  JSON, y lanza `ApiError` en 4xx/5xx y en fallo de red; `fetchHealth`
  resuelve en 200 y lanza en 503.
- `useServerStatus.test.tsx`: con `fetch` simulado, verifica `loading`
  → `online` (200) y `loading` → `offline` (fallo). Se prueba el estado
  derivado, sin depender del DOM del shell.
- La navegación y el 404 se validan manualmente con Chrome DevTools
  (RF-1, RF-2, RF-3 y RNF-2), porque son de interacción.

## Riesgos

- CORS del backend solo permite el origen de producción de Vercel: para
  probar en local contra `127.0.0.1:3000` puede fallar por CORS. Se anota
  como caso límite ya cubierto por RF-6 (se ve "no disponible"); el
  arreglo de CORS, si hace falta, es en `Civik-Backend`, no acá.
