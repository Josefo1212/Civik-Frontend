# Tareas 007 — Listado global de estudiantes y secciones dadas de baja

- [ ] **T1. API y hooks (estudiantes global + secciones con inactivas).**
  RF-1, RF-3, RF-8.
  - `features/estudiantes/api.ts`: `listarTodos(incluirInactivas)`.
  - `features/estudiantes/hooks/useEstudiantes.ts`:
    `estudiantesQueryKeys.todos` y `useEstudiantesGlobal`.
  - `features/secciones/api.ts` + `hooks/useSecciones.ts`:
    `incluirInactivas` opcional (sin regresión).
  - Tests de URL (api) para `/students` y `/sections`.
  - Hecho cuando: `pnpm test:run` verde con los tests nuevos.

- [ ] **T2. Utilidades puras (rótulo de sección y buscador).**
  RF-2, RF-4.
  - `features/secciones/utils.ts` (`etiquetaSeccion`) + test.
  - `features/estudiantes/utils.ts` (`normalizar`, `filtrarEstudiantes`) +
    test.
  - Hecho cuando: los tests de ambas utilidades pasan.

- [ ] **T3. Tabla global de estudiantes.**
  RF-1, RF-2, RF-3, RF-7, RF-9.
  - `features/estudiantes/components/TablaEstudiantesGlobal.tsx` + test
    (activo/inactivo, reactivar, rótulo de respaldo, vacío).
  - Hecho cuando: los tests de la tabla pasan.

- [ ] **T4. Lista de secciones dadas de baja.**
  RF-6, RF-9.
  - `features/secciones/components/ListaSeccionesInactivas.tsx` + test.
  - Hecho cuando: los tests de la lista pasan.

- [ ] **T5. Modo "Todos" en la página Estudiantes.**
  RF-1 a RF-9.
  - `pages/EstudiantesPage/index.tsx`: selector de modo; en "Todos",
    buscador + toggle de inactivos + `TablaEstudiantesGlobal` +
    `ListaSeccionesInactivas`, con reactivación de estudiante y sección.
  - Test de la página con la API mockeada (global, inactivos, buscador,
    error, reactivar).
  - Hecho cuando: los tests de la página pasan.

- [ ] **T6. Cierre de la fase.**
  - Repaso RF por RF; `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y
    `pnpm build` verdes.
  - Marcar spec y tareas como implementadas; actualizar `MEMORY.md`.
  - Hecho cuando: los cuatro comandos están verdes y la spec quedó
    `implementada`.
