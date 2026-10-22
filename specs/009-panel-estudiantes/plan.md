# Plan 009 — Panel de estudiantes

Referencia: `spec.md` (Estado: aprobada). Este plan cubre el QUÉ técnico:
archivos, llamadas a la API, estado de UI, offline y estrategia de tests.

## Decisiones técnicas

### D1. El panel vive en `EstudiantesPage`; no se crea una página nueva

La fila expandible es una capacidad del listado de estudiantes, no una
pantalla aparte. Se agrega a `pages/EstudiantesPage/index.tsx` y a los
componentes de `features/estudiantes/`. Alternativa descartada: una ruta
`/estudiantes/:id` con panel de detalle — agrega navegación y estado de ruta
que la spec descartó (sin deep-link), y parte otra vez el flujo.

Cubre: RF-7, RF-8, RF-9, RF-14, RF-15, RF-16, RF-16b.

### D2. La asistencia por eventos se compone en el cliente (N queries de evento)

`usePadron` es por evento. El panel necesita la asistencia de **todos** los
eventos del lapso para un estudiante. Se reusa `useEventos(lapsoId)` y se
pide el padrón de cada evento con `listarPadron(eventoId)` (mismo endpoint
`GET /events/{id}/attendance`), en paralelo con `useQueries` de TanStack
Query. No se toca el backend ni se agrega endpoint.

Alternativa descartada: pedir el padrón solo del evento expandido — la spec
exige ver todos los eventos del lapso de una vez (RF-9).

Riesgo: N requests por lapso. Aceptable a esta escala (sin paginación,
RF/RNF-4). Cada padrón ya usa `conRespaldo`/Dexie, así que hereda el respaldo
offline de lectura.

Cubre: RF-9, RF-16b.

### D3. La fusión con el outbox reusa `fusionarPadron` por evento

Cada evento tiene su propio outbox (clave `id_event`). Para cada evento se
hace `listarPendientesDeEvento(eventoId)` y se fusiona con `fusionarPadron`.
Se mira **todos** los eventos del lapso, no solo uno.

Cubre: RF-16b, RF-17, RF-19.

### D4. La corrección reusa `useGuardarAsistencia` tal cual

`useGuardarAsistencia.mutate([{ id_event, id_student, state }])` ya encola y
sincroniza (RF-17); el id de cliente (`crypto.randomUUID()`) lo genera
`encolar` una sola vez y no lo regenera (RF-18); ante conflicto el ítem queda
en el outbox marcado con `error` y el `SincronizarBoton`/aviso lo refleja
(RF-19). No se escribe lógica nueva de sync.

Alternativa descartada: `registrarAsistencia` (POST `/attendance` directo) —
rompería el offline y el "un solo camino" que fija `MEMORY.md`.

Cubre: RF-17, RF-18, RF-19, RF-20, RF-21.

### D5. La nota reusa la fusión de `FilaNota` con el buscar por estudiante

`useNotas(lapsoId, seccionId)` devuelve `FilaNota[]` por lapso+sección. El
panel toma la fila del estudiante expandido. La marca provisional/definitiva
reusa `esNotaProvisional`/`textoEstadoNota` de `features/notas/utils.ts`
(`estado !== 'CLOSED'` → provisional, RF-11). La marca override y "sin nota"
reusan `MARCA_OVERRIDE`/`SIN_NOTA`.

Cubre: RF-10, RF-11, RF-12, RF-13.

### D6. La corrección se limita a eventos `SCHEDULED`

Un evento `CANCELLED` no admite corrección (no tuvo asistencia). Se lista
marcado con su motivo (RF-14) pero su celda de estado es de solo lectura.

Cubre: RF-14, RF-20.

## Archivos

### Se crean

- `features/estudiantes/hooks/useAsistenciaLapso.ts` — dado un lapso y una
  lista de eventos, devuelve por `id_student` el mapa `id_event → state` ya
  fusionado con el outbox. Responsabilidad: composición de N queries +
  fusión. Cubre RF-9, RF-14, RF-15, RF-16b.
- `features/estudiantes/components/FilaExpandible.tsx` (+ `.module.css`) —
  el detalle del estudiante: tabla de eventos (fecha, nombre, tipo, estado,
  marca cancelado+motivo, marca pendiente) con control inline para corregir;
  bloque de nota con aviso provisional/override/sin nota. Recibe datos por
  props (sin fetch propio). Cubre RF-9 a RF-16.
- `features/estudiantes/hooks/useAsistenciaLapso.test.tsx` — tests de la
  composición y fusión.
- `features/estudiantes/components/FilaExpandible.test.tsx` — tests de
  render de estados (pendiente, cancelado, corrección, provisional,
  override, sin nota).
- `pages/DashboardPage/index.tsx` (+ `.module.css`) — el dashboard en `/`:
  lapso activo + conteo de activos por sección. Cubre RF-1 a RF-6.
- `pages/DashboardPage/DashboardPage.test.tsx` — tests del dashboard.

### Se modifican

- `pages/EstudiantesPage/index.tsx` — agrega el lapso seleccionado
  (preselección del activo, RF-8), el selector de lapso, y hace que la fila
  del estudiante sea expandible inyectando `FilaExpandible`. Mantiene modo
  por-sección y modo global, buscador, toggles y textos/roles actuales.
- `features/estudiantes/components/TablaEstudiantes.tsx` y
  `TablaEstudiantesGlobal.tsx` — botón de expandir por fila y render del
  detalle cuando está abierta. Sin fetch propio.
- `app/router.tsx` — `/` → `DashboardPage` (ya no `Navigate` a secciones);
  se elimina la ruta y el import de `NotasPage`.
- `constants/routes.ts` — se quita `notas` de `RUTAS` y de
  `NAVEGACION_PRINCIPAL`.
- `features/notas/*` — se conserva **solo** lo puro que el panel reusa
  (`utils.ts`, `constants.ts`, `hooks/useNotas.ts`, `api.ts`, tests). Se
  eliminan `components/AvisoNota`, `components/TablaNotas` y sus tests
  (su rol lo cumple `FilaExpandible`). Decisión: no borrar la feature entera
  para no duplicar lógica de provisional/override.
- `MEMORY.md` — cierre de fase.

### Se eliminan

- `pages/NotasPage/` — la ruta deja de existir (RF-7).

## Estado de UI

- TanStack Query: `useLapsos`, `useEventos(lapsoId)`, `useQueries` sobre
  `usePadron`-por-evento, `useNotas(lapsoId, seccionId)`, `useSecciones`,
  `useEstudiantes*`. Sin estado global nuevo.
- Estado local (`useState`) en `EstudiantesPage`: `lapsoId` (inicializado al
  lapso activo cuando llega la data), `filaExpandidaId`.
- Estado local en `FilaExpandible`: ninguna fuente de verdad; el estado
  mostrado sale de la fusión + el outbox (liveQuery para pendientes), y la
  mutación se dispara con `useGuardarAsistencia`.

## Offline y sincronización

- Lectura: cada padrón usa `conRespaldo` (Dexie) — heredado, sin cambios.
- Escritura: `useGuardarAsistencia` → `encolar` → `sincronizar` (D2/D4).
  No se toca `sync/`. El id de cliente y el conflicto ya están cubiertos.
- `FilaExpandible` muestra el estado de sync por evento (pendiente/error)
  reusando el tipo `EstadoSyncFila` de `sync/fusionar.ts`.

## Estrategia de tests

- Lógica (Vitest): `useAsistenciaLapso` (composición N eventos + fusión con
  outbox; pendiente = `state null` en evento pasado; cancelado excluido de
  corrección) y preselección del lapso activo. Cubren RF-8, RF-9, RF-15,
  RF-16b, RF-17, RF-18, RF-19.
- Render (Testing Library): `FilaExpandible` con cada caso (pendiente,
  cancelado + motivo, provisional, override, sin nota, corrección) y
  `DashboardPage` (lapso activo, sin activo, conteos, error + reintentar).
  Cubren RF-2 a RF-6, RF-10 a RF-14.
- No regresión (RF-21): la suite de Asistencia/PadronAsistencia/outbox debe
  seguir verde sin cambios.
- Visual (Chrome DevTools): recorrido RF a RF en escritorio y móvil 375 px,
  consola limpia; foco de teclado en expandir/corregir.

## Orden de implementación (para `tasks.md`)

1. Retirar Notas como ruta (router, routes, borrar NotasPage).
2. Dashboard en `/` (RF-1..RF-6).
3. `useAsistenciaLapso` (RF-9, RF-15, RF-16b) + tests.
4. `FilaExpandible` (RF-9..RF-16) + tests.
5. Fila expandible + preselección de lapso activo en Estudiantes (RF-7, RF-8).
6. Corrección inline con `useGuardarAsistencia` (RF-17..RF-20) + tests.
7. Limpieza de `features/notas` (componentes retirados) y MEMORY.md.
