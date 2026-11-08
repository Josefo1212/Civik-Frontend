# Tareas 010 — PDF de notas

Ref: `spec.md` (aprobada) y `plan.md` (aprobado). Una tarea por vez: test
primero en rojo si hay lógica, código después, verdes, marcar y PARAR.

- [x] **T1. Instalar `jspdf` + `jspdf-autotable` y verificar acentos.**
  - `pnpm add jspdf jspdf-autotable`.
  - Generar un PDF de prueba con el texto `Pérez Núñez — 1ro A` y comprobar
    que los acentos y la `ñ` salen correctos (visor de PDF o `pdftotext`).
  - Si salen mal, embeber una TTF con `addFileToVFS` + `addFont` y repetir la
    comprobación.
  - Hecho cuando: el PDF de prueba se lee bien (acentos y `ñ` correctos) y
    `pnpm typecheck` sigue limpio. La separación del chunk se verifica en T4,
    cuando ya existe el import dinámico.
  - RF-5, RNF-3, RNF-4.

- [x] **T2. Módulo puro de armado + tests.**
  - Crear `src/features/notas/pdf/armado.ts` con `FilaPdf`, `GrupoPdf`,
    `ordenarSecciones`, `armarGruposPdf` y `nombreArchivoPdf`.
  - `armado.test.ts` en rojo primero: orden `5to a`, `1ro b`, `1ro a`, `3ro`
    → `1ro a`, `1ro b`, `3ro`, `5to a`; sección inactiva descartada;
    `nota: null` y `esOverride` conservados; nombre con y sin sección.
  - Hecho cuando: `pnpm test:run -- armado` en verde y `pnpm typecheck` limpio.
  - RF-9, RF-10, RF-11, RF-12, RF-13, RF-18.

- [x] **T3. Constantes del documento.**
  - Crear `src/features/notas/pdf/constants.ts` con `tituloDocumento(anio)`,
    `COLUMNAS_PDF` y `LEYENDA_OVERRIDE`; reutilizar `AVISO_PROVISIONAL` y
    `SIN_NOTA` de `features/notas/constants.ts`.
  - Hecho cuando: `pnpm typecheck` y `pnpm lint` limpios; el título contiene
    literalmente "Listado de notas de estudiantes de La Brigada del Valle año
    escolar".
  - RF-6, RF-13, RF-14.

- [x] **T4. Generador del documento PDF.**
  - Crear `src/features/notas/pdf/documento.ts` con `generarDocumentoPdf`:
    import dinámico, A4, encabezado repetido, tabla por sección, `Sin nota`,
    `*` de override + leyenda, aviso provisional, `Página X de Y` y
    `doc.save(nombreArchivoPdf(...))`.
  - Hecho cuando: `pnpm typecheck` y `pnpm lint` limpios, y un PDF de muestra
    generado con los datos de prueba contiene el encabezado, las cinco
    columnas y las filas en orden. `pnpm build` deja `jspdf` en un chunk
    separado del bundle inicial.
  - RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-18.

- [x] **T5. Hook `useNotasPdf` + tests.**
  - Crear `src/features/notas/hooks/useNotasPdf.ts` con `fetchQuery` por
    sección, `Promise.all`, validación de alcance vacío y estados
    `generando`/`error`.
  - `useNotasPdf.test.tsx` en rojo primero (mock de `listarNotas` y de
    `documento.ts`): una sección, todas en orden, fallo de una sección sin
    descarga, alcance sin estudiantes sin descarga, `generando` de ida y
    vuelta.
  - Hecho cuando: el test del hook en verde y `pnpm typecheck` limpio.
  - RF-15, RF-16, RF-17, RF-19.

- [x] **T6. Componente `BarraPdf` + CSS + tests.**
  - Crear `src/features/notas/components/BarraPdf.tsx` y
    `BarraPdf.module.css` con `SelectField`, `Button` y `Alert`.
  - `BarraPdf.test.tsx` en rojo primero: opciones "Todas las secciones" +
    secciones; botón deshabilitado con motivo; cambio de alcance; click;
    error visible.
  - Hecho cuando: el test del componente en verde y se ve como hermano de la
    barra del lapso (vidrio, alineación al fondo).
  - RF-1, RF-2, RF-3, RF-4, RF-16.

- [ ] **T7. Integrar en `AlumnosYSeccionesPage`.**
  - Estado `seccionPdfId` derivado contra las secciones activas, `useNotasPdf`
    y `BarraPdf` junto a `SelectorLapso`; contenedor flex en el CSS.
  - `index.pdf.test.tsx` en rojo primero: la barra aparece, el botón se
    deshabilita sin lapso y el click llama a `generar`.
  - Hecho cuando: el test de página en verde y `pnpm test:run` completo en
    verde.
  - RF-1, RF-3, RF-4, RF-5.

- [ ] **T8. Validación end-to-end y cierre.**
  - Chrome DevTools: descargar el PDF de una sección y de "Todas las
    secciones"; abrirlo y verificar encabezado, lapso, aviso
    provisional/definitiva, columnas, orden 1ro A → 5to, "Sin nota", `*` de
    override y acentos; consola limpia; 375 px.
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
  - Marcar la spec `implementada`, actualizar `MEMORY.md` y commit de cierre.
  - Hecho cuando: el recorrido RF a RF no tiene fallos y los cuatro comandos
    pasan.
  - RF-5 a RF-14, RNF-3, RNF-5.

## Validación (tras T1–T8)

- Recorrido RF a RF de la spec.
- Chrome DevTools en escritorio y móvil 375 px: descarga, apertura y
  contenido del PDF, foco de teclado en el selector y el botón, consola
  limpia.
