# Tareas 005 — PWA y sincronización offline de asistencia

- [ ] **T1. Dependencias + base Dexie + caché de lectura.**
  RF-10.
  - Instalar `dexie`, `vite-plugin-pwa`, `fake-indexeddb`.
  - `src/sync/db.ts` (`outbox`, `cache`) y `src/sync/cache.ts`
    (`clavesCache`, `guardarCache`, `leerCache`, `conRespaldo`).
  - `src/test/setup.ts` con `fake-indexeddb/auto`.
  - Tests de `conRespaldo`: guarda al responder, cae al cache si falla por
    red, re-lanza si el cache está vacío.
  - Hecho cuando: `pnpm test:run` verde con los tests nuevos.

- [ ] **T2. Outbox.**
  RF-2, RF-3, RF-4, RF-5, RF-7, RF-14.
  - `src/sync/outbox.ts` (`encolar`, `listarPendientes`,
    `listarPendientesDeEvento`, `eliminar`, `marcarError`,
    `contarPendientes`).
  - Tests: `encolar` genera id con `crypto.randomUUID()`; reencolar el
    mismo par conserva el id y actualiza el estado; `eliminar` borra;
    `contarPendientes`.
  - Hecho cuando: los tests del outbox pasan.

- [ ] **T3. Contrato de sync + `syncManager`.**
  RF-6, RF-7, RF-8, RF-9, RF-14.
  - `domain/asistencia.ts`: `ResultadoSync`, `ItemResultadoSync`,
    `ItemSync`.
  - `features/asistencia/api.ts`: `sincronizarAsistencia`.
  - `sync/syncManager.ts`: puras (`agruparPorEvento`, `aQuitar`,
    `conflictosDe`) + `sincronizar` con la API mockeada.
  - Tests: éxito parcial con un conflicto (se quitan los confirmados, el
    conflicto queda); error de red conserva todo; `409` conserva todo con
    el motivo.
  - Hecho cuando: los tests del manager pasan.

- [ ] **T4. Lectura con respaldo en caché.**
  RF-10, RF-11.
  - Envolver `queryFn` de `useLapsos`, `useEventos` y `usePadron` con
    `conRespaldo` y su clave de cache.
  - Test: un hook con red caída y cache presente devuelve el dato
    cacheado.
  - Hecho cuando: los tests de hooks pasan.

- [ ] **T5. Escritura por outbox + fusión del padrón.**
  RF-2, RF-5, RF-11, RF-12.
  - `sync/fusionar.ts`: `fusionarPadron(filas, pendientes)`.
  - `useGuardarAsistencia` (en vez de `useRegistrarAsistencia`): encola y,
    si hay red, sincroniza.
  - `PadronAsistencia` usa la fusión y el nuevo hook;
    `ListaAsistencia` muestra "pendiente/error" por fila.
  - Tests: `fusionarPadron` (local pisa al del servidor, marca de
    pendiente) y `ListaAsistencia` con `estadoSync`.
  - Hecho cuando: los tests de fusión y de la lista pasan.

- [ ] **T6. UI de sincronización + disparadores.**
  RF-6, RF-8, RF-12.
  - `sync/useSyncEstado.ts` (`useSyncExternalStore` sobre el manager).
  - `sync/SincronizarBoton.tsx`: contador de pendientes, botón manual,
    aviso de conflicto/offline.
  - `sync/RegistrarSincronizacion.tsx`: dispara al arrancar y en `online`;
    limpia el listener.
  - `app/queryClient.ts` (mueve el cliente) y `AppShell` con el botón y el
    registrador.
  - Tests: `SincronizarBoton` muestra el contador y se deshabilita al
    sincronizar.
  - Hecho cuando: los tests del botón pasan.

- [ ] **T7. PWA instalable + persistencia de almacenamiento.**
  RF-1, RF-13.
  - `vite.config.ts` con `VitePWA` (manifest + Workbox precache) y
    `vite-env.d.ts` con los tipos de `virtual:pwa-register`.
  - Íconos en `public/`; `main.tsx` registra el SW y llama a
    `navigator.storage.persist()` (con guarda).
  - Test de la guarda de `persist` si es extraíble; verificación real por
    `pnpm build` (genera `manifest.webmanifest` y `sw.js`).
  - Hecho cuando: `pnpm build` genera la PWA y el typecheck pasa.

- [ ] **T8. Cierre de la fase.**
  - Repaso RF por RF; `pnpm lint`, `pnpm typecheck`, `pnpm test:run`,
    `pnpm build` verdes.
  - Marcar spec y tareas como implementadas; actualizar `MEMORY.md`.
  - Hecho cuando: los cuatro comandos están verdes y la spec quedó
    `implementada`.
