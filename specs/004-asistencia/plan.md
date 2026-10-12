# Plan 004 — Asistencia online (Fase 3)

## Archivos que se crean

### Dominio (`src/domain/`)
- `asistencia.ts` — `EstadoAsistencia` (`PRESENTE|AUSENTE|JUSTIFICADO`) y
  `FilaPadron` (`id_student`, `first_name`, `last_name`, `state`). Vocabulario
  del backend. RF-2, RF-4.

### Feature asistencia (`src/features/asistencia/`)
- `constants.ts` — estados, etiquetas y helper `etiquetaEstado`. RF-2, RF-4.
- `api.ts` — `listarPadron(eventoId)` (`GET /events/{id}/attendance`) y
  `registrarAsistencia(eventoId, items)` (`POST` con `{ items }`). RF-2, RF-5,
  RF-8.
- `hooks/usePadron.ts` — `useQuery` con key `['asistencia', eventoId]`;
  deshabilitada sin evento.
- `hooks/useRegistrarAsistencia.ts` — `useMutation` que invalida
  `['asistencia']` y devuelve el padrón actualizado.
- `components/SelectorEvento.tsx` — `<select>` de eventos del lapso; las
  opciones `CANCELLED` quedan deshabilitadas. RF-1, RF-9.
- `components/ListaAsistencia.tsx` — por cada `FilaPadron`, muestra apellido,
  nombre y un grupo de radios Presente/Ausente/Justificado; "Sin marcar" cuando
  `state` es `null`. Reporta el cambio al padre. RF-2, RF-4.
- `components/PadronAsistencia.tsx` — contenedor: maneja el mapa local
  `id_student -> estado`, calcula los cambios contra el servidor, muestra el
  botón "Guardar asistencia" (deshabilitado sin cambios o mientras envía) y
  delega el registro. RF-3, RF-5, RF-6, RF-7, RF-8, RF-11.

### Página (`src/pages/AsistenciaPage/index.tsx`)
Reemplaza el placeholder: `SelectorLapso` + `SelectorEvento` + `PadronAsistencia`
con estados de carga/error, reintentar y estados vacíos.

## Archivos que se modifican
- `src/pages/AsistenciaPage/index.tsx` (placeholder → pantalla).

## Reutilización
- `features/lapsos` (`useLapsos`, `SelectorLapso`) y `features/eventos`
  (`useEventos`) para elegir lapso y evento; no se reimplementa nada.

## Llamadas a `api/*`
- `listarPadron`: `GET /events/{id}/attendance` → `FilaPadron[]`.
- `registrarAsistencia`: `POST /events/{id}/attendance` con
  `{ items: [{ id_student, state }] }` → `FilaPadron[]` (padrón actualizado).
- La corrección (RF-8) usa el mismo `POST` (upsert); el `PATCH` individual queda
  fuera de esta fase.

## Estado de UI (TanStack Query vs local)
- Padrón: `useQuery`.
- Registro: `useMutation` con invalidación de la key del padrón.
- Selección de estados: estado local de `PadronAsistencia` (mapa
  `id_student -> EstadoAsistencia | null`), inicializado desde el padrón y
  reseteado cuando cambia el evento (por `key` en el padre, no por efecto).
- Lapso y evento elegidos: `useState` en la página.

## Offline / sincronización
No aplica: la Fase 3 es online. El `POST` en lote es exactamente lo que la
Fase 4 encolará en Dexie; acá se llama directo.

## Decisiones técnicas
- **Corrección vía re-guardado, no `PATCH`**: el `POST` es un upsert por PK, así
  que cambiar un estado y guardar de nuevo corrige sin código extra. Alternativa
  descartada: disparar un `PATCH` por cada cambio de radio (más peticiones y
  estado de error por fila para el mismo resultado).
- **"Sin marcar" distinto de ausente** (skill de dominio): un estado `null` se
  muestra como "Sin marcar" y no se envía; no se convierte en ausencia.
- **Eventos `CANCELLED` deshabilitados, no ocultos**: el usuario ve el evento
  pero no puede elegirlo (RF-9), evitando un 409 evitable sin duplicar la regla
  (el backend igual lo rechaza).

## Estrategia de tests
- `asistencia/api.test.ts`: URL, método y body de `listarPadron` y
  `registrarAsistencia` (incluido que manda solo los `items`).
- `ListaAsistencia.test.tsx`: muestra "Sin marcar" para `state` nulo, cambia el
  estado al elegir un radio y notifica al padre.
- `PadronAsistencia.test.tsx`: el botón guardar está deshabilitado sin cambios y
  habilitado al marcar; al guardar llama con los cambios.

## RF cubiertos
- Página/selector: RF-1, RF-9, RF-10. Padrón/lista: RF-2, RF-3. Registro:
  RF-4…RF-8, RF-11.
