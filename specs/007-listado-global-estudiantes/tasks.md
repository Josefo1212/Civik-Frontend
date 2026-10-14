# Tareas 007 — Listado global de estudiantes y secciones dadas de baja

- [x] **T1. API y hooks (estudiantes global + secciones con inactivas).**
  RF-1, RF-3, RF-8.
  - `features/estudiantes/api.ts`: `listarTodos(incluirInactivas)`.
  - `features/estudiantes/hooks/useEstudiantes.ts`:
    `estudiantesQueryKeys.todos` y `useEstudiantesGlobal`.
  - `features/secciones/api.ts` + `hooks/useSecciones.ts`:
    `incluirInactivas` opcional (sin regresión).
  - Tests de URL (api) para `/students` y `/sections`.
  - Hecho cuando: `pnpm test:run` verde con los tests nuevos.

- [x] **T2. Utilidades puras (rótulo de sección y buscador).**
  RF-2, RF-4.
  - `features/secciones/utils.ts` (`etiquetaSeccion`) + test.
  - `features/estudiantes/utils.ts` (`normalizar`, `filtrarEstudiantes`) +
    test.
  - Hecho cuando: los tests de ambas utilidades pasan.

- [x] **T3. Tabla global de estudiantes.**
  RF-1, RF-2, RF-3, RF-7, RF-9.
  - `features/estudiantes/components/TablaEstudiantesGlobal.tsx` + test
    (activo/inactivo, reactivar, rótulo de respaldo, vacío).
  - Hecho cuando: los tests de la tabla pasan.

- [x] **T4. Lista de secciones dadas de baja.**
  RF-6, RF-9.
  - `features/secciones/components/ListaSeccionesInactivas.tsx` + test.
  - Hecho cuando: los tests de la lista pasan.

- [x] **T5. Modo "Todos" en la página Estudiantes.**
  RF-1 a RF-9.
  - `pages/EstudiantesPage/index.tsx`: selector de modo; en "Todos",
    buscador + toggle de inactivos + `TablaEstudiantesGlobal` +
    `ListaSeccionesInactivas`, con reactivación de estudiante y sección.
  - Test de la página con la API mockeada (global, inactivos, buscador,
    error, reactivar).
  - Hecho cuando: los tests de la página pasan.

- [x] **T6. Cierre de la fase.**
  - Repaso RF por RF; `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y
    `pnpm build` verdes.
  - Marcar spec y tareas como implementadas; actualizar `MEMORY.md`.
  - Hecho cuando: los cuatro comandos están verdes y la spec quedó
    `implementada`.

## Revisión (2026-10-13, hallazgos de la validación visual)

- [x] **T7. Reintento cubre padrón y secciones.** RF-8.
  - `pages/EstudiantesPage/index.tsx`: tomar `error` y `refetch` de
    `useSecciones(undefined, true)`; tratar el error de cualquiera de las
    dos lecturas como el error de la vista; "Reintentar" reintenta ambas
    (`refetchGlobal()` + el de secciones).
  - Test de página: padrón en error → "Reintentar" llama a ambos refetch;
    secciones en error → la vista muestra el mensaje y el botón.
  - Hecho cuando: los tests de la página pasan.

- [x] **T8. Estado vacío distinto para el buscador.** RF-7, RF-10.
  - `features/estudiantes/components/TablaEstudiantesGlobal.tsx`: prop
    `mensajeVacio: string` en vez del texto fijo.
  - `pages/EstudiantesPage/index.tsx`: deriva `mensajeVacio` del buscador
    ("no hay estudiantes" vs. "sin coincidencias para «<texto>»").
  - Tests: la tabla muestra el `mensajeVacio` recibido; la página muestra
    cada mensaje en su caso.
  - Hecho cuando: los tests de la tabla y de la página pasan.

- [x] **T9. Cierre de la revisión.**
  - Validación visual con Chrome DevTools: reintento tras un corte deja el
    rótulo correcto sin recargar; el estado vacío del buscador es distinto
    del de padrón vacío.
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes;
    spec, plan y tareas vuelven a `implementada`; actualizar `MEMORY.md`.
  - Hecho cuando: los cuatro comandos están verdes y la validación quedó
    registrada.
