# Tareas 000 — Bootstrap

Una tarea a la vez: test primero si es lógica, luego código, `pnpm test`
verde, `pnpm lint` sin warnings, marcar y **PARAR**.

- [x] **T1. Instalar dependencias y scripts.** RF-4
  - Hecho cuando: `pnpm add react-router-dom @tanstack/react-query` y
    `pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
    terminan; `package.json` tiene `test`, `test:run`, `typecheck`; `pnpm install` limpio.

- [x] **T2. Configurar Vitest + jsdom + jest-dom.** RNF-1
  - Hecho cuando: `vite.config.ts` tiene el bloque `test`, existe
    `src/test/setup.ts` con `@testing-library/jest-dom`, tsconfig y eslint
    en orden, y un test de humo corre en verde con `pnpm test:run`.

- [x] **T3. Cliente API base y health.** RF-4, RF-6, RF-7
  - Hecho cuando: `src/api/client.ts` (`apiFetch` + `ApiError`),
    `src/api/health.ts` (`fetchHealth`), `src/vite-env.d.ts` tipa
    `VITE_API_URL` y existe `.env.example`; `client.test.ts` (200, 503,
    fallo de red, URL base) pasa en verde.

- [x] **T4. Hook `useServerStatus`.** RF-4, RF-5, RF-6
  - Hecho cuando: `useServerStatus.test.tsx` verifica `loading → online`
    (200) y `loading → offline` (error) con `fetch` simulado, en verde.

- [x] **T5. Constantes de rutas, páginas placeholder, router y 404.**
  RF-1, RF-2, RF-3
  - Hecho cuando: `constants/routes.ts`, las 5 `pages/*/index.tsx`,
    `app/router.tsx` (AppShell de layout + 5 rutas + `*` → NotFound) y
    `components/NotFound` existen, y `pnpm build` compila sin errores.

- [x] **T6. AppShell, indicador de estado, providers y estilos.**
  RF-1, RF-4, RNF-2
  - Hecho cuando: `app/providers.tsx`, `components/AppShell` (nav +
    `ServerStatus` + `<Outlet/>`), `components/ServerStatus`,
    `styles/global.css`; `main.tsx` monta `providers` + `RouterProvider`.

- [x] **T7. Limpiar el template de Vite.** RNF-1
  - Hecho cuando: se eliminan `src/App.tsx`, `src/App.css` y los assets
    del template; `index.html` tiene `lang="es"`, título y viewport;
    `pnpm lint` y `pnpm typecheck` sin errores.

- [x] **T8. Validación y cierre.** RF-1…RF-7, RNF-1, RNF-2
  - Hecho cuando: con Chrome DevTools se navega entre las 5 rutas y la
    404 (URL actualizada, sin errores en consola), se ve el estado del
    servidor con el backend caído y luego levantado, se comprueba la vista
    móvil, la spec queda en `implementada` y `MEMORY.md` actualizado.
