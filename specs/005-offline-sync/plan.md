# Plan 005 — PWA y sincronización offline de asistencia

Estado: implementada

## Resumen de la arquitectura

Tres piezas nuevas, más dos toques a lo existente:

1. **PWA** (`vite-plugin-pwa` + Workbox): manifest, precache del shell y
   registro del service worker. `navigator.storage.persist()` al instalar.
   Cubre RF-1 y RF-13.
2. **`sync/`** (infraestructura offline, no UI):
   - `db.ts`: instancia Dexie con las tablas `outbox` y `cache`.
   - `cache.ts`: respaldo de lectura (leer/guardar/get-or-fetch). RF-10.
   - `outbox.ts`: cola de cambios. RF-2 a RF-5, RF-7, RF-9, RF-14.
   - `syncManager.ts`: agrupado, envío, interpretación de resultados y
     vaciado del outbox. RF-6 a RF-9, RF-14.
3. **UI de sincronización**: contador, botón manual, aviso de conflicto y
   de modo offline; estado por estudiante en el padrón. RF-11, RF-12.

Se reusa `features/asistencia` (padrón, lista) y `features/lapsos|eventos`
(hooks de lectura), cambiando la escritura a "outbox primero".

## Archivos que se crean / modifican

### `sync/db.ts` (nuevo)

- `CivikDb extends Dexie` con:
  - `outbox: '&id, id_event'` — `&id` es clave primaria.
  - `cache: '&clave'`.
- Tipos de fila (`ItemOutbox`, `EntradaCache`) en este archivo o en
  `domain`; el outbox es infra local, así que viven acá.
- Exporta una única instancia `db`.
- Responsabilidad: esquema y conexión. Sin lógica. Cubre RF-2 (soporte).

### `sync/cache.ts` (nuevo)

- `clavesCache`: helpers (`lapsos()`, `eventos(lapsoId)`, `padron(eventoId)`).
- `guardarCache<T>(clave, valor)` y `leerCache<T>(clave)`.
- `conRespaldo<T>(clave, remoto)`: intenta `remoto()`; si responde,
  guarda y devuelve; si falla por red (`ApiError.status === null`),
  devuelve el cache o re-lanza. Función pura salvo por la tabla inyectada.
- Cubre RF-10 y RF-11.
- Decisión: respaldo **network-first** (no cache-first) porque el padrón
  cambia; el cache es solo para cuando no hay red. Alternativa descartada:
  persistencia de TanStack Query (agrega dependencias y no distingue
  "offline" de "error" tan simple).

### `sync/outbox.ts` (nuevo)

- `encolar({ id_event, id_student, state })`: busca una entrada pendiente
  del mismo par; si existe, actualiza `state`/`cambio_en` conservando el
  `id`; si no, crea una con `crypto.randomUUID()` y `cambio_en = new Date().toISOString()`.
- `listarPendientes()`, `listarPendientesDeEvento(id_event)`.
- `eliminar(ids)`, `marcarError(id, mensaje)`.
- `contarPendientes()`.
- Funciones puras de cálculo + acceso a `db`; se testean con
  `fake-indexeddb`. Cubre RF-3, RF-4, RF-7.

### `sync/syncManager.ts` (nuevo)

- Puras y testeadas aparte:
  - `agruparPorEvento(items)`: `Map<id_event, items>`.
  - `aQuitar(resultados)`: ids con resultado `creado|aplicado|sin_cambio`.
  - `conflictosDe(resultados)`: ítems `conflicto`.
- Orquestación:
  - `sincronizar()`: por cada grupo llama a
    `sincronizarAsistencia(id_event, items)` (`features/asistencia/api`),
    quita confirmados, marca conflictos, actualiza el cache del padrón con
    los `state`/`updated_at` devueltos y actualiza el estado observable.
  - Manejo del rechazo del lote (`ApiError` con `status` 4xx): conserva el
    grupo, marca cada ítem con el motivo (`marcarError`) para que su fila
    muestre "error" y corta el lote (RF-14); error de red: conserva todo
    sin marcar (RF-9). `esRechazoDeLote(error)` es la función pura que
    distingue ambos casos.
- Estado observable mínimo (`pendientes`, `sincronizando`, `conflictos`,
  `ultimoError`, `enLinea`) con `suscribir`/`obtenerEstado` para
  `useSyncExternalStore`. Cubre RF-6, RF-7, RF-8, RF-9, RF-14.
- `observarPendientes()`: se suscribe a `contarPendientes()` con
  `liveQuery` de Dexie y actualiza `pendientes` ante cualquier cambio del
  outbox (encolar, eliminar, marcar error), sin depender de que haya una
  sincronización en curso. Devuelve la función para desuscribir. Cubre
  RF-12.

### `features/asistencia/api.ts` (modificar)

- Agregar `sincronizarAsistencia(eventoId, items)` →
  `POST /events/{id}/attendance/sync`, body `{ items }` con
  `{ id_student, state, cambio_en }`; devuelve `ItemResultadoSync[]`.
- Tipos de sync en `domain/asistencia.ts`.

### `domain/asistencia.ts` (modificar)

- `ResultadoSync = 'creado'|'aplicado'|'sin_cambio'|'conflicto'`.
- `ItemResultadoSync = { id_student; resultado; state: EstadoAsistencia|null; updated_at }`.
- `ItemSync = { id_student; state; cambio_en: string }`.

### `features/asistencia/hooks/useGuardarAsistencia.ts` (nuevo, reemplaza a `useRegistrarAsistencia`)

- `mutate`: `encolar(items)` y, si `enLinea`, `sincronizar()`.
- Invalida el padrón al terminar para refrescar.
- Cubre RF-2, RF-5.

### `sync/fusionar.ts` (nuevo, puro)

- `fusionarPadron(filas, pendientes)`: devuelve filas con `state` local de
  los pendientes y `estadoSync: 'pendiente'|'error'|null`. Cubre RF-5,
  RF-11, RF-12.

### Hooks de lectura (modificar)

- `features/lapsos/hooks/useLapsos.ts`, `features/eventos/hooks/useEventos.ts`,
  `features/asistencia/hooks/usePadron.ts`: `queryFn` envuelto en
  `conRespaldo` con su clave de cache. Cubre RF-10, RF-11.

### UI (modificar / crear)

- `features/asistencia/components/ListaAsistencia.tsx`: mostrar "pendiente"
  por fila según `estadoSync` (RF-12).
- `features/asistencia/components/PadronAsistencia.tsx`: aplicar
  `fusionarPadron` con los pendientes del evento; botón guardar usa
  `useGuardarAsistencia`. RF-5, RF-12.
- `sync/useSyncEstado.ts` (nuevo): `useSyncExternalStore` sobre el manager.
- `sync/SincronizarBoton.tsx` (nuevo): botón manual + contador + aviso de
  conflicto/offline. RF-6, RF-8, RF-12.
- `sync/RegistrarSincronizacion.tsx` (nuevo): en `useEffect`, dispara el
  sync al arrancar, escucha `online` y se suscribe a `observarPendientes()`
  para mantener el contador en vivo (`RF-12`); limpia el listener y la
  suscripción al desmontar. RF-6, RF-12.
- `components/AppShell/AppShell.tsx`: incorpora `SincronizarBoton` y
  `RegistrarSincronizacion`. RF-12.
- `app/queryClient.ts` (nuevo): mueve el `QueryClient` para que el manager
  lo use; `app/providers.tsx` lo importa.

### PWA (crear)

- `vite.config.ts`: agregar `VitePWA({ registerType: 'autoUpdate', ... })`
  con manifest (nombre, tema, íconos) y `workbox` con precache del shell.
- `public/icon-192.png`, `public/icon-512.png`, `public/maskable-512.png`.
- `src/main.tsx`: `registerSW` de `virtual:pwa-register` y
  `navigator.storage.persist()` (guardado) al registrar. RF-1, RF-13.
- `src/vite-env.d.ts`: `/// <reference types="vite-plugin-pwa/client" />`.

### Dependencias

- Runtime: `dexie`.
- Dev: `vite-plugin-pwa`, `fake-indexeddb`, `@types/... ` no hacen falta
  extras.

## Estado de UI

- TanStack Query: sigue siendo la fuente de lectura; su `queryFn` cae al
  cache de Dexie cuando no hay red.
- Estado local: selección de lapso/evento (ya existe).
- Estado fuera de React: outbox y sync (`useSyncExternalStore`), para que
  el contador y el estado por fila no dependan del árbol de componentes.

## Estrategia de tests

- Puras: `outbox`, `fusionar`, `agruparPorEvento`, `aQuitar`,
  `conflictosDe`, `conRespaldo`.
- Integración ligera: `syncManager.sincronizar` con la API mockeada
  (éxito parcial con conflicto, error de red, `409`).
- `observarPendientes` con `fake-indexeddb`: al encolar sin sincronizar,
  el estado `pendientes` del manager se actualiza solo (RF-12).
- `fake-indexeddb` en `src/test/setup.ts` para que Dexie funcione en
  jsdom.
- Componente: `ListaAsistencia` con `estadoSync`, `SincronizarBoton`
  (contador y aviso).
- PWA: el build debe terminar y generar el manifest y el SW (verificación
  por `pnpm build`, no unitaria).

## Riesgos

- `vite-plugin-pwa` durante Vitest: el plugin puede intentar resolver
  `virtual:pwa-register`. Mitigación: solo `main.tsx` lo importa (ningún
  test importa `main.tsx`) y se desactiva el plugin cuando corre Vitest si
  hiciera falta.
- `navigator.storage` puede no existir en jsdom: se accede con guarda.
