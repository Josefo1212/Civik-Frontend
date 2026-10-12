# Plan 003 — Eventos (Fase 2)

## Archivos que se crean

### Dominio (`src/domain/`)
- `lapso.ts` — `Lapso`, `EstadoLapso` (`PLANNED|ACTIVE|CLOSED`), `DiaSemana`
  (catálogo `MONDAY…SUNDAY`). RF-1, RF-2, RF-4.
- `evento.ts` — `Evento`, `EstadoEvento` (`SCHEDULED|CANCELLED`), `TipoEvento`
  (`PRACTICA_REGULAR|PRACTICA_EXTRA|PRESENTACION`), `OrigenEvento`
  (`AUTO|MANUAL`). Campos con el vocabulario exacto del backend. RF-6, RF-8,
  RF-10.

### Feature lapsos (`src/features/lapsos/`)
- `constants.ts` — días, etiquetas de día y de estado, tipos y opciones. RF-2.
- `api.ts` — `listarLapsos` (`GET /lapses`), `crearLapso` (`POST /lapses`),
  `activarLapso` (`POST /lapses/{id}/activar`), `cerrarLapso`
  (`POST /lapses/{id}/cerrar`). Payload con strings porque el backend
  deserializa `school_year`, `lapse_number`, fechas y día como texto. RF-1–RF-5.
- `hooks/useLapsos.ts` — `useQuery` con key `['lapsos']`.
- `hooks/useLapsoMutations.ts` — mutaciones que invalidan `['lapsos']`.
- `components/SelectorLapso.tsx` — `<select>` controlado por el padre. RF-1,
  RF-6.
- `components/FormularioLapso.tsx` — formulario con estado interno, sincronizado
  con `valorInicial`; valida "campos completos" antes de habilitar guardar. RF-2,
  RF-3.
- `components/TablaLapsos.tsx` — listado con estado y acciones activar/cerrar
  según el estado. RF-4, RF-5, RF-13.

### Feature eventos (`src/features/eventos/`)
- `constants.ts` — tipos de evento con etiquetas, estados con etiquetas, origen
  con etiquetas. RF-6, RF-8, RF-10.
- `api.ts` — `listarEventos(lapseId?)` (`GET /events[?lapse_id=]`),
  `crearEvento` (`POST /events`), `cancelarEvento` (`POST /events/{id}/cancel`).
  RF-6–RF-11.
- `hooks/useEventos.ts` — `useQuery` con key `['eventos', idLapse]`; no consulta
  si no hay lapso.
- `hooks/useEventoMutations.ts` — mutaciones que invalidan `['eventos']`.
- `components/FormularioEvento.tsx` — fecha, tipo (select) y nombre; estado
  interno + sincronización. RF-8, RF-9.
- `components/ListaEventos.tsx` — lista (tabla) con fecha, nombre, tipo, estado
  y motivo; botón "Cancelar" solo para `SCHEDULED`. RF-6, RF-10, RF-12.
- `components/AccionCancelarEvento.tsx` — motivo (obligatorio) + confirmar;
  deshabilitado con motivo vacío o mientras envía. RF-10, RF-11, RF-13.

### Página (`src/pages/EventosPage/index.tsx`)
Reemplaza el placeholder. Maneja: lapso seleccionado, lapso a cerrar (no hace
falta confirmación destructiva, la operación es del backend), y el estado local
de la lista; compone `SelectorLapso`, `FormularioLapso`, `TablaLapsos`,
`FormularioEvento` y `ListaEventos`.

## Archivos que se modifican
- `src/pages/EventosPage/index.tsx` (placeholder → pantalla).
- `src/features/secciones/components/FormularioSeccion.tsx` y
  `src/features/estudiantes/components/FormularioEstudiante.tsx` — **corrección
  previa**: usaban `onChange={() => {}}` con `value` controlado, lo que hacía
  los campos de solo-lectura (React revierte el valor). Se les agrega estado
  interno sincronizado con `valorInicial`. Necesario para que la app existente
  funcione y para no replicar el patrón roto en los formularios nuevos.
- Tests de esos formularios: agregar un caso que escribe en un campo.

## Llamadas a `api/*`
Todas usan `apiSend`/`apiFetch` de `src/api/client.ts` (ya resuelve base URL,
body JSON, 204 y mensajes de error del backend). No se toca el cliente.

## Estado de UI (TanStack Query vs local)
- Datos del servidor (lapsos y eventos): `useQuery` + `useMutation` con
  invalidación de sus keys.
- Estado de pantalla (lapso elegido, qué evento está cancelándose, error
  general): `useState` local en la página.
- Formularios: estado interno propio; el padre pasa `valorInicial` solo para
  edición (en esta fase, lapso y evento no se editan; se mantiene la misma
  convención por consistencia y para el fix de los formularios existentes).

## Offline / sincronización
No aplica. La cola de Dexie es para asistencia (Fase 4); eventos y lapsos son
online-only.

## Decisiones técnicas
- **Gestión de lapsos dentro de EventosPage** (no una ruta nueva): la
  navegación principal está fijada en 5 rutas y los lapsos son una dependencia
  del calendario, no un flujo con pantalla propia. Alternativa descartada:
  agregar `/lapsos` y un ítem al menú (cambia la navegación sin necesidad).
- **Sin confirmación destructiva para cancelar/cerrar**: el backend es la
  fuente de verdad y sus mensajes explican el rechazo; el repo ya decidió no
  usar diálogos de confirmación (spec 001).
- **No ocultar el formulario en lapso `CLOSED`**: no se duplica la regla de
  negocio; se muestra el mensaje del backend (RNF-1).

## Estrategia de tests
- `lapsos/api.test.ts` y `eventos/api.test.ts`: URL, método y body de cada
  llamada (patrón de `secciones/api.test.ts`), incluido el `?lapse_id=`.
- `FormularioLapso.test.tsx` y `FormularioEvento.test.tsx`: escribir en los
  campos y verificar el `onSubmit` (cubre de paso que los campos ya no son
  solo-lectura), y estado deshabilitado.
- `ListaEventos.test.tsx`: motivo visible para cancelados y botón cancelar
  ausente en `CANCELLED`.
- Fix de formularios existentes: test que escribe y envía lo escrito.

## RF cubiertos
- API lapso: RF-1…RF-5. API evento: RF-6…RF-11.
- Componentes: selector/lista RF-1, RF-6, RF-7, RF-12; formularios RF-2, RF-3,
  RF-8, RF-9; cancelar RF-10, RF-11, RF-13; estado vacío RF-14.
