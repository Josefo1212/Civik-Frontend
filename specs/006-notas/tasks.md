# Tareas 006 — Notas

- [x] **T1. Dominio, API y hook de notas.**
  RF-1, RF-6, RF-7, RF-9.
  - `src/domain/nota.ts` (`FilaNota`).
  - `src/features/notas/api.ts` (`listarNotas`) + test de la URL.
  - `src/features/notas/hooks/useNotas.ts` (enabled con ambos ids).
  - Hecho cuando: `pnpm test:run` verde con los tests nuevos.

- [x] **T2. Aviso de provisional y utilidades.**
  RF-2, RF-3.
  - `features/notas/utils.ts` (`esNotaProvisional`, `textoEstadoNota`) y
    `constants.ts`.
  - `features/notas/components/AvisoNota.tsx` + test.
  - Hecho cuando: los tests de la utilidad y del aviso pasan.

- [x] **T3. Tabla de notas.**
  RF-4, RF-5, RF-8.
  - `features/notas/components/TablaNotas.tsx` + test (nota vs "Sin
    nota"; `0.00` no es "Sin nota"; vacío).
  - Hecho cuando: los tests de la tabla pasan.

- [x] **T4. Página de notas.**
  RF-1, RF-6, RF-7, RF-8, RF-9.
  - `pages/NotasPage/index.tsx` con los selectores, el aviso y la tabla;
    carga/error/reintento y vacíos.
  - Test de la página con la API mockeada (camino feliz, sin secciones,
    error).
  - Hecho cuando: los tests de la página pasan.

- [x] **T5. Cierre de la fase.**
  - Repaso RF por RF; `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y
    `pnpm build` verdes.
  - Marcar spec y tareas como implementadas; actualizar `MEMORY.md`.
  - Hecho cuando: los cuatro comandos están verdes y la spec quedó
    `implementada`.

- [x] **T6. Marcar el override.**
  RF-10.
  - `domain/nota.ts`: agregar `es_override: boolean` a `FilaNota`.
  - `TablaNotas.tsx`: marcar "editada manualmente" cuando `es_override`.
  - Tests de `TablaNotas` (marca presente/ausente) y fixtures de la
    página (`es_override`).
  - Hecho cuando: los tests pasan con la marca y la spec quedó sin
    limitaciones pendientes.
