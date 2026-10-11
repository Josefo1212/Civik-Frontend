# Tareas 002 — Estudiantes

- [ ] **T1. Tipo `Estudiante` y dominio.** RF-2, RF-6
  - Hecho cuando: existe `src/domain/estudiante.ts` con los campos del contrato; `pnpm typecheck` limpio.

- [ ] **T2. Funciones de API de estudiantes + tests.** RF-2, RF-4, RF-5, RF-7, RF-8, RF-10
  - Hecho cuando: `listarPorSeccion(seccionId, incluirInactivas)`, `crearEnSeccion`, `editarEstudiante`, `darDeBaja`, `reactivar` existen; tests verifican rutas/métodos; verde.

- [ ] **T3. Hooks de consulta y mutaciones.** RF-2, RF-3, RF-4, RF-6–RF-9
  - Hecho cuando: `useEstudiantes` con clave `['estudiantes', { seccionId, incluirInactivas }]`; mutaciones invalidan esa clave.

- [ ] **T4. SelectorSeccion reutilizando `useSecciones`.** RF-1
  - Hecho cuando: componente para elegir sección activa.

- [ ] **T5. FormularioEstudiante + tests.** RF-4, RF-5, RF-6, RF-9
  - Hecho cuando: formulario con apellido/nombre/teléfono/opcional + selector de sección; tests pasan.

- [ ] **T6. TablaEstudiantes + toggle "Mostrar inactivos".** RF-2, RF-7, RF-8
  - Hecho cuando: muestra estado, acciones baja/reactivar según estado; toggle funciona.

- [ ] **T7. Componer `EstudiantesPage`.** RF-1–RF-10
  - Hecho cuando: integra selector, toggle, formulario, tabla; maneja errores; build compila.

- [ ] **T8. Validación, cierre spec y MEMORY.** RF-1–RF-10, RNF-1–RNF-3
  - Hecho cuando: lint/typecheck/tests/build verdes; spec a `implementada`; `MEMORY.md` actualizado.
