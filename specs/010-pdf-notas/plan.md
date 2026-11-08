# Plan 010 — PDF de notas

Estado: borrador

## Resumen

Se agrega una barra junto al selector de lapso con un selector de alcance
(una sección o "Todas las secciones") y un botón "Generar PDF". Al pulsarlo,
la app pide las notas al backend (una consulta por sección), arma las filas y
descarga un PDF generado en el navegador.

No hay lógica de negocio nueva: la nota y `es_override` salen del backend; el
front solo ordena, agrupa y dibuja (constitución nº 1).

## Decisiones técnicas

### Librería: `jspdf` + `jspdf-autotable`

Decisión del usuario. Se usa la API funcional `autoTable(doc, opciones)` (v5),
no el plugin `doc.autoTable(...)` de versiones viejas.

Alternativas descartadas:

- `pdfmake`: pesa mucho más (~500 KB+) para una tabla simple.
- `@react-pdf/renderer`: obliga a describir el documento como componentes
  React; más complejidad y bundle para el mismo resultado.
- `window.print()` + CSS `@media print`: no produce un archivo descargable
  con nombre y encabezado controlados.

La librería se importa con `await import(...)` **dentro** de la función que
genera el documento, para que `jspdf` quede en un chunk aparte y no engorde el
bundle inicial de la PWA (RNF-4).

### Consulta de notas bajo demanda

El botón no dispara consultas al cambiar de lapso o de sección. Al pulsarlo,
`useNotasPdf` llama a `queryClient.fetchQuery` una vez por sección con la
misma `queryKey` de `useNotas`, así:

- reutiliza la caché que ya llena `DetalleEstudiante` al expandir un alumno;
- evita pedir datos que el usuario nunca va a exportar;
- permite que `Promise.all` falle completo si una sección falla, sin descargar
  un PDF incompleto (RF-15).

Alternativa descartada: `useQueries` con `enabled` atado a la selección.
Prefetchea en cada cambio aunque el usuario no genere, y complica distinguir
"cargando la vista" de "generando el PDF".

### Orden canónico en una función pura

`ordenarSecciones` ordena por el índice de `GRADOS` (`1ro`…`5to`) y, dentro
del grado, por subdivisión con `localeCompare('es')`. No se confía solo en el
orden del backend: la función es testeable y no depende de que la respuesta
venga ordenada. Dentro de cada sección se **preserva** el orden del roster
del backend (apellido, nombre), que ya es el orden de la tabla de notas.

### Encabezado repetido y paginación

`autoTable` recibe `didDrawPage` para dibujar el encabezado del documento y el
número de página en cada página. `margin.top` reserva el alto del encabezado
para que la tabla nunca lo pise. La numeración "Página X de Y" se estampa en
una segunda pasada, cuando ya se conoce el total.

### Acentos

Se usan las fuentes estándar de jsPDF (Helvetica, codificación WinAnsi), que
cubren `á é í ó ú ü ñ`. La primera tarea incluye una verificación real del
PDF; si algún carácter sale mal, se embebe una fuente TTF con los glifos
necesarios (`addFileToVFS` + `addFont`) y se repite la validación.

## Archivos que se crean / modifican

### `package.json` (modificar)

- Agregar `jspdf` y `jspdf-autotable` a `dependencies`.
- Sin cambios de scripts.

### `src/features/notas/pdf/armado.ts` (nuevo, puro)

Tipos y funciones sin DOM ni librería de PDF:

- `FilaPdf = { apellido; nombre; anio; seccion; nota: string | null; esOverride }`.
- `GrupoPdf = { idSeccion; anio; seccion; turno; filas: FilaPdf[] }`.
- `ordenarSecciones(secciones: Seccion[]): Seccion[]` — índice de `GRADOS`,
  luego subdivisión (RF-9).
- `armarGruposPdf(secciones, notasPorSeccion: ReadonlyMap<string, FilaNota[]>)`
  — descarta secciones inactivas, ordena y mapea cada `FilaNota` a `FilaPdf`
  (RF-9, RF-10, RF-11, RF-12, RF-13). Conserva `nota: null` y `esOverride`.
- `nombreArchivoPdf({ anioEscolar, lapso, grupo? }): string` — por ejemplo
  `notas-2026-lapso-2.pdf` o `notas-2026-lapso-2-1ro-a.pdf` (RF-18).

### `src/features/notas/pdf/armado.test.ts` (nuevo)

- Orden: `5to a`, `1ro b`, `1ro a`, `3ro` → `1ro a`, `1ro b`, `3ro`, `5to a`.
- Una sección inactiva no genera grupo.
- `nota: null` se conserva como `null`; `es_override` se conserva.
- Nombre de archivo con y sin sección.

### `src/features/notas/pdf/constants.ts` (nuevo)

- `tituloDocumento(anioEscolar)` →
  `Listado de notas de estudiantes de La Brigada del Valle año escolar ${anioEscolar}`.
- `COLUMNAS_PDF = ['Apellido', 'Nombre', 'Año', 'Sección', 'Nota final']`.
- `LEYENDA_OVERRIDE = '(*) Nota editada manualmente.'`.
- `AVISO_PROVISIONAL` y `SIN_NOTA` se reutilizan de
  `features/notas/constants.ts` (una sola fuente de texto).

### `src/features/notas/pdf/documento.ts` (nuevo)

- `generarDocumentoPdf(opciones): Promise<void>`.
- `await import('jspdf')` + `await import('jspdf-autotable')` dentro de la
  función (RNF-4).
- Documento A4 vertical, márgenes de 14 mm y 40 mm arriba para el encabezado.
- Encabezado (en cada página, vía `didDrawPage`):
  - título `tituloDocumento(anioEscolar)` (RF-6);
  - `Lapso {n} · Nota provisional|definitiva` (RF-7);
  - si el alcance es una sección, `Año {anio} · Sección {seccion}` (RF-8);
  - aviso `AVISO_PROVISIONAL` mientras no esté `CLOSED` (RF-14).
- Una tabla por grupo con subtítulo `etiquetaSeccion` cuando hay más de un
  grupo (RF-9). Columnas `COLUMNAS_PDF` (RF-10).
- `nota ?? SIN_NOTA` (RF-11); el string de la nota se usa tal cual (RF-12).
- Si alguna fila tiene `esOverride`, la nota lleva `*` y al final va
  `LEYENDA_OVERRIDE` (RF-13).
- `doc.save(nombreArchivoPdf(...))` (RF-5, RF-18).
- Pie con `Página X de Y` en una segunda pasada.

### `src/features/notas/hooks/useNotasPdf.ts` (nuevo)

- Entrada: `{ lapso: Lapso | null; secciones: Seccion[]; seccionId: string | null }`.
- Salida: `{ generar, generando, error }`.
- `generar()`:
  1. valida lapso; si no hay, no hace nada (el botón ya está deshabilitado);
  2. elige las secciones del alcance (una o todas las activas);
  3. `Promise.all` de `queryClient.fetchQuery` con `notasQueryKeys.porPar` y
     `listarNotas` (RF-15, RF-19);
  4. `armarGruposPdf`; si todos los grupos quedan sin filas, error "No hay
     estudiantes para incluir" (RF-17);
  5. `generarDocumentoPdf` con año escolar, número de lapso,
     `esNotaProvisional(lapso.status)` y los grupos;
  6. en `catch`, guarda un mensaje en español; en `finally`, apaga
     `generando` (RF-16).
- Sin `useEffect` ni estado derivado en efectos.

### `src/features/notas/hooks/useNotasPdf.test.tsx` (nuevo)

Con `QueryClientProvider` y `listarNotas` mockeado; `documento.ts` mockeado
para no cargar jsPDF en jsdom:

- una sección → una consulta y un grupo;
- todas → una consulta por sección, en orden canónico;
- una consulta falla → no se llama a `generarDocumentoPdf` y hay error;
- alcance sin estudiantes → no se llama a `generarDocumentoPdf` y hay error;
- `generando` pasa a `true` y vuelve a `false`.

### `src/features/notas/components/BarraPdf.tsx` + `.module.css` (nuevos)

- Props: `secciones`, `valor`, `onCambiar`, `onGenerar`, `generando`,
  `deshabilitado`, `motivoDeshabilitado`, `error`.
- `SelectField` con `id="selector-seccion-pdf"`, etiqueta "Sección" y opciones
  "Todas las secciones" + cada sección con `etiquetaSeccion` (RF-1, RF-2).
- `Button variante="secondary"` "Generar PDF" con `cargando={generando}` y
  `disabled={deshabilitado}`; `title` con el motivo (RF-3, RF-4, RF-16).
- `Alert variante="error"` debajo cuando hay `error` (RF-15, RF-17).
- Estilo de vidrio como hermano de la barra del lapso, alineado al fondo para
  que el botón quede a la altura del select (RNF-5).

### `src/features/notas/components/BarraPdf.test.tsx` (nuevo)

- Renderiza "Todas las secciones" y las secciones activas.
- Sin lapso/secciones: botón deshabilitado con el motivo.
- Elegir una sección llama a `onCambiar` con el id; elegir "Todas" con `null`.
- Click en "Generar PDF" llama a `onGenerar`.
- Con `error`, se muestra el `Alert`.

### `src/pages/AlumnosYSeccionesPage/index.tsx` (modificar)

- Estado local `seccionPdfId`; se deriva `seccionPdfValida` contra las
  secciones activas (sin `useEffect`).
- `useNotasPdf({ lapso, secciones, seccionId: seccionPdfValida })`.
- Reemplaza el `void secciones` por el uso real del listado activo.
- Envuelve la barra del lapso y `BarraPdf` en un contenedor flex (RF-1).

### `src/pages/AlumnosYSeccionesPage/AlumnosYSeccionesPage.module.css` (modificar)

- `.barraLapsoPdf { display: flex; flex-wrap: wrap; align-items: stretch; gap: var(--esp-3); }`.
- Sin tocar `.barraLapso`.

### `src/pages/AlumnosYSeccionesPage/index.pdf.test.tsx` (nuevo)

- Mocks de los hooks de la página (mismo patrón que
  `pages/EstudiantesPage/index.test.tsx`) y de `useNotasPdf`.
- La barra del PDF aparece junto al selector de lapso.
- Sin lapso, el botón está deshabilitado.
- Click en "Generar PDF" llama a `generar`.

## Estado de UI

- `seccionPdfId`: estado local de la página (alcance del PDF).
- `generando` y `error`: estado local del hook `useNotasPdf`.
- TanStack Query: solo caché de las notas (`fetchQuery`), sin query propia
  nueva. No hay outbox ni sincronización: es una lectura (constitución nº 2).
- El filtro de sección del listado (`filtroSeccionId`) **no** se toca ni se
  comparte con el selector del PDF.

## Llamadas a la API

- `GET /lapses/{lapsoId}/sections/{seccionId}/grades` por cada sección del
  alcance, vía `listarNotas` (`features/notas/api.ts`).
- Ninguna escritura.

## Estrategia de tests

| Capa | Qué prueba |
|---|---|
| `armado.test.ts` | orden canónico, mapeo de filas, `null`/override, nombre de archivo (RF-9 a RF-13, RF-18) |
| `useNotasPdf.test.tsx` | una vs todas, fallo de una sección, alcance vacío, `generando` (RF-15 a RF-17, RF-19) |
| `BarraPdf.test.tsx` | opciones, deshabilitado, cambio de alcance, click (RF-1 a RF-4, RF-16) |
| `index.pdf.test.tsx` | integración de la barra en la página (RF-1, RF-3, RF-5) |
| Chrome DevTools | descarga real, apertura del PDF, acentos, encabezado, orden 1ro→5to, 375 px (RF-5 a RF-14, RNF-3, RNF-5) |

No se testea el dibujo interno de jsPDF con Vitest: jsdom no tiene canvas y el
resultado binario no aporta. La verificación visual es con Chrome DevTools.

## Riesgos

- **Acentos con fuentes estándar**: verificar en la primera tarea; si falla,
  embeber TTF (agrega peso al chunk dinámico, no al inicial).
- **Tipado de `doc.lastAutoTable`**: si la augmentación no está disponible, se
  usa un tipo local estrecho (`{ lastAutoTable: { finalY: number } }`), sin
  `any`.
- **jsPDF en jsdom**: no debe importarse en tests. El hook mockea
  `documento.ts`; el componente no lo importa.
- **Varias tablas en un mismo documento**: `startY` se toma de
  `lastAutoTable.finalY`; si no alcanza el espacio, se agrega página antes de
  la siguiente sección.
- **Bundle**: el import dinámico debe quedar en un chunk separado; se verifica
  en `pnpm build` que el chunk inicial no crezca con jsPDF.
