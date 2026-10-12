# Plan 006 — Notas

Estado: implementada

## Resumen

Vista de solo lectura. Se compone de dos selectores (lapso y sección) que
reusan componentes existentes, un aviso de provisional/definitiva y una
tabla con la nota por estudiante. No hay lógica de negocio: la nota se
muestra tal cual la devuelve el backend.

## Archivos que se crean / modifican

### `src/domain/nota.ts` (nuevo)

- `FilaNota = { id_student; first_name; last_name; nota: string | null;
  es_override: boolean }`. Refleja `NotaDto` del backend. La nota es
  `string` (o `null`), no `number`: no se parsea ni se reformatea.

### `src/features/notas/constants.ts` (nuevo)

- `SIN_NOTA = 'Sin nota'`.
- `AVISO_PROVISIONAL`, `AVISO_DEFINITIVA`.

### `src/features/notas/utils.ts` (nuevo, puro)

- `esNotaProvisional(estado: EstadoLapso): boolean` → `estado !== 'CLOSED'`.
- `textoEstadoNota(estado): string` → el aviso correspondiente. Puro y
  testeable (RNF-2).

### `src/features/notas/api.ts` (nuevo)

- `listarNotas(lapsoId, seccionId): Promise<FilaNota[]>` →
  `apiSend(..., 'GET')` a
  `/lapses/{lapsoId}/sections/{seccionId}/grades`. Cubre RF-1, RF-6.

### `src/features/notas/hooks/useNotas.ts` (nuevo)

- `notasQueryKeys.porPar(lapsoId, seccionId)`.
- `useNotas(lapsoId, seccionId)`: `enabled` solo si ambos están elegidos
  (RF-7). TanStack Query maneja carga/error/reintento (RF-9).

### `src/features/notas/components/TablaNotas.tsx` (nuevo) + test

- Props: `filas: FilaNota[]`.
- Tabla: estudiante (`Apellido, Nombre`) y nota; `null` → "Sin nota"
  (RF-4, RF-5). Si `es_override`, la nota lleva una marca de "editada
  manualmente" (RF-10). Estado vacío propio (RF-8).
- Test: una fila con nota, una con `null`; `null` muestra "Sin nota"; una
  nota `"0.00"` no se confunde con "Sin nota"; una fila con
  `es_override: true` muestra la marca y una calculada no.

### `src/features/notas/components/AvisoNota.tsx` (nuevo) + test

- Props: `estado: EstadoLapso`.
- Muestra el aviso de provisional (RF-2) o definitiva (RF-3) usando
  `textoEstadoNota`.
- Test: `ACTIVE`/`PLANNED` → provisional; `CLOSED` → definitiva.

### `src/pages/NotasPage/index.tsx` (reemplaza el placeholder)

- Estado local: `lapsoId`, `seccionId`.
- `useLapsos()` → `SelectorLapso`; `useSecciones(undefined)` →
  `SelectorSeccion`.
- `useNotas(lapsoId, seccionId)` → `AvisoNota` + `TablaNotas`.
- Estados: carga, error con reintento (RF-6, RF-9), vacíos de lapsos y
  secciones (RF-8), "elegí lapso y sección" (RF-7).
- El estado del lapso elegido se deriva de `lapsos.find(id)` para el
  aviso.

### Tests de página

- Con la API mockeada: elegir lapso y sección muestra la tabla y el aviso;
  sin secciones muestra el vacío; error de la consulta muestra el reintento.

## Estado de UI

- TanStack Query para la consulta de notas (carga/error/reintento).
- Estado local solo para la selección de lapso y sección.
- Sin outbox ni caché offline: no es un flujo offline.

## Estrategia de tests

- Puras: `esNotaProvisional` / `textoEstadoNota`.
- Componentes: `TablaNotas` (nota vs "sin nota"), `AvisoNota`.
- Página: con `vi.mock` de `features/notas/api`, cubrir el camino feliz,
  el vacío y el error.

## Riesgos

- (ninguno pendiente; el contrato ya expone `es_override`)
