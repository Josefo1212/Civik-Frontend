# Spec 005 — PWA y sincronización offline de asistencia

Estado: aprobada

## Contexto y objetivo

El instructor toma asistencia en el aula desde el teléfono, a veces sin
conexión. La Fase 3 resolvió el registro **en línea** (padrón del evento y
`POST /events/{id}/attendance`). Esta spec agrega lo que falta para usarlo
sin internet: instalar la app como PWA, abrirla sin conexión, guardar las
marcas en un outbox local y subirlas al recuperar la red sin duplicarlas
ni pisar una versión más nueva del servidor.

El backend (Fase 9) ya expone `POST /events/{id}/attendance/sync`: recibe
los cambios con `cambio_en` (reloj del cliente) y responde, por ítem,
`creado | aplicado | sin_cambio | conflicto`. El conflicto **no es un
error**: viaja en un `200` con el estado del servidor para que el cliente
reconcilie. El front no recalcula esa regla (la tolerancia de reloj y la
decisión viven en el backend).

## Usuarios

- Instructor (único usuario del sistema).

## Historias de usuario

- HU-1. Como instructor, quiero abrir la app sin conexión y ver el último
  padrón del evento para poder tomar asistencia.
- HU-2. Como instructor, quiero marcar asistencia sin conexión y que no se
  pierda aunque cierre o recargue la app.
- HU-3. Como instructor, quiero que al volver la conexión mis marcas se
  sincronicen solas y sin duplicarse.
- HU-4. Como instructor, quiero enterarme si el servidor tenía una marca
  más nueva, sin que mi trabajo se descarte en silencio.
- HU-5. Como instructor, quiero poder forzar la sincronización con un
  botón (en iOS no hay sincronización en segundo plano).

## Definiciones

- **Outbox**: cola local (IndexedDB/Dexie) con los cambios de asistencia
  hechos y todavía no confirmados por el servidor.
- **Pendiente**: un cambio que vive en el outbox y no fue confirmado.
- **Conflicto**: el servidor ya tiene otra marca para el mismo par
  (evento, estudiante) más nueva que la del cliente; no se pisa.
- **`cambio_en`**: instante del cambio según el reloj del cliente.
- **Caché de lectura**: última respuesta guardada de lapso/evento/padrón,
  usada solo como respaldo cuando no hay red.

## Requisitos funcionales

- RF-1. EL SISTEMA se instala como PWA y, después de una primera visita
  con conexión, abre el shell sin conexión.
- RF-2. CUANDO el usuario guarda asistencia, EL SISTEMA deja el cambio
  en el outbox **antes** de intentar enviarlo al servidor.
- RF-3. EL SISTEMA genera el id de cada cambio del outbox con
  `crypto.randomUUID()` una sola vez, y nunca lo regenera en un reintento.
- RF-4. CUANDO ya existe un cambio pendiente para el mismo par (evento,
  estudiante), EL SISTEMA actualiza ese cambio (mismo id) en vez de crear
  uno nuevo.
- RF-5. MIENTRAS un cambio está pendiente, EL SISTEMA muestra su estado
  local en el padrón (el local pisa al del servidor) y lo señala como
  "pendiente".
- RF-6. CUANDO la app arranca, CUANDO el navegador emite `online`, o
  CUANDO el usuario toca "Sincronizar", EL SISTEMA envía los pendientes
  agrupados por evento a `POST /events/{id}/attendance/sync`.
- RF-7. CUANDO el servidor responde `creado`, `aplicado` o `sin_cambio`
  para un ítem, EL SISTEMA quita ese ítem del outbox.
- RF-8. SI el servidor responde `conflicto` para un ítem, ENTONCES EL
  SISTEMA mantiene el ítem en el outbox, lo marca como "error" y avisa al
  usuario que refresque; nunca lo descarta ni lo pisa sin avisar.
- RF-9. SI la sincronización falla por falta de red, ENTONCES EL SISTEMA
  conserva todos los ítems y los reintenta en el próximo disparo.
- RF-10. EL SISTEMA guarda en IndexedDB el último lapsos, eventos por
  lapso y padrón por evento que vio, y los usa como respaldo cuando una
  consulta falla por falta de conexión.
- RF-11. CUANDO el usuario ve un padrón sin conexión, EL SISTEMA muestra
  el padrón cacheado con sus pendientes aplicados y avisa que está offline.
- RF-12. EL SISTEMA muestra el estado de sincronización de cada estudiante
  (pendiente / error) y un contador de cambios pendientes que refleja el
  outbox **en vivo**: se actualiza apenas se encola, se confirma o falla un
  cambio, sin esperar a una sincronización ni a recargar la app (incluye el
  guardado sin conexión, cuando no se dispara ningún envío).
- RF-13. CUANDO se instala la PWA, EL SISTEMA solicita
  `navigator.storage.persist()` para reducir el riesgo de que el navegador
  purgue IndexedDB.
- RF-14. SI el servidor rechaza el lote entero (evento cancelado, lapso
  cerrado, estado inválido: `400`/`409`), ENTONCES EL SISTEMA mantiene los
  ítems en el outbox y muestra el motivo, sin borrarlos.

## Requisitos no funcionales

- RNF-1. Las reglas de armado y vaciado del outbox, la fusión
  padrón + pendientes y la interpretación de resultados son funciones
  puras, testeables sin DOM (constitución nº 3).
- RNF-2. El outbox no pierde datos: ningún ítem se elimina antes de la
  confirmación del servidor (constitución nº 4).
- RNF-3. Textos y comentarios en español; vocabulario de dominio en
  español (constitución nº 7).
- RNF-4. Tests con Vitest + `fake-indexeddb`; sin red real.

## Casos límite

- Marcar sin conexión y recargar la app: el padrón cacheado con sus
  pendientes sigue disponible.
- Reintento con la respuesta perdida: el backend lo trata como idempotente
  (`sin_cambio`) y el ítem se quita.
- Conflicto: el ítem queda pendiente y marcado como error; no se pierde.
- Dos marcas seguidas del mismo estudiante sin conexión: un solo ítem con
  el último estado.
- Lote mixto: los ítems aplicables se quitan, el conflicto queda.
- Marcar sin conexión un evento cancelado o en lapso cerrado: el lote se
  rechaza y los ítems se conservan con el motivo.
- Marcar sin conexión: el contador de pendientes sube al instante aunque
  no haya conexión ni envío.
- Cambiar el outbox fuera de una sincronización (encolar sin red): el
  contador refleja el nuevo total sin recargar.
- IndexedDB no disponible: la app funciona en línea; guardar sin conexión
  informa que no se pudo guardar localmente (no falla en silencio).

## Fuera de alcance

- Escritura offline de otros recursos (eventos, lapsos, notas): solo la
  asistencia se encola.
- Sincronización en segundo plano (Background Sync): iOS no la soporta.
- Sincronización bidireccional (traer cambios del servidor al cliente).

## Criterios de finalización

- RF-1 a RF-14 verificados: unitarios con `fake-indexeddb` para outbox,
  fusión e interpretación de resultados; `pnpm build` genera la PWA
  (manifest + service worker) sin errores.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- Spec marcada `implementada`, `MEMORY.md` actualizado y commit de cierre.

## Dudas abiertas

Resueltas en la clarificación del 2026-10-12:

- **Alcance de lectura offline: padrón cacheado.** Además del shell de la
  PWA y el outbox, se guarda en IndexedDB el último lapsos/eventos/padrón
  vistos, para poder abrir y tomar asistencia sin conexión aunque se
  recargue la app. Alternativa descartada: solo shell + outbox, que dejaba
  la pantalla sin datos tras una recarga offline.

- **Contador de pendientes en vivo (RF-12).** En la validación visual se
  detectó que el contador solo se actualizaba al arrancar, al volver la
  conexión o al sincronizar; tras un guardado sin conexión (que no dispara
  envío) quedaba desactualizado. Se precisó RF-12: el contador refleja el
  outbox en vivo. Implementación: `syncManager` observa la tabla con
  `liveQuery` y actualiza el estado de forma reactiva. Alternativa
  descartada: refrescar el contador solo tras `encolar` en el hook de
  guardado, que deja fuera a cualquier otro escritor del outbox.
