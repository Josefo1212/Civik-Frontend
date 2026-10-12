# Tareas 003 — Eventos (Fase 2)

- [x] **T1. Corregir formularios existentes (bug de solo-lectura).** RNF-4
  - Hecho cuando: `FormularioSeccion` y `FormularioEstudiante` permiten escribir
    y envían lo escrito; sus tests incluyen un caso de escritura en verde.

- [x] **T2. Dominio lapso y evento.** RF-1, RF-6
  - Hecho cuando: `domain/lapso.ts` y `domain/evento.ts` tipan el contrato del
    backend; `pnpm typecheck` sin errores.

- [x] **T3. API de lapsos + tests.** RF-1…RF-5
  - Hecho cuando: `lapsos/api.test.ts` verifica URL/método/body de listar,
    crear, activar y cerrar.

- [x] **T4. API de eventos + tests.** RF-6…RF-11
  - Hecho cuando: `eventos/api.test.ts` verifica listar (con y sin `lapse_id`),
    crear y cancelar.

- [x] **T5. Hooks de lapsos y eventos.** RF-1, RF-6, RF-13
  - Hecho cuando: `useLapsos`, `useLapsoMutations`, `useEventos` y
    `useEventoMutations` compilan e invalidan sus keys.

- [x] **T6. Componentes de lapsos + tests.** RF-2, RF-3, RF-4, RF-5, RF-13
  - Hecho cuando: `FormularioLapso` envía campos completos y `TablaLapsos`
    ofrece activar/cerrar según estado; test del formulario en verde.

- [x] **T7. Componentes de eventos + tests.** RF-7, RF-8, RF-9, RF-10, RF-11,
  RF-12
  - Hecho cuando: `FormularioEvento` envía fecha/tipo/nombre y
    `ListaEventos`/`AccionCancelarEvento` muestran motivo y deshabilitan con
    motivo vacío; tests en verde.

- [x] **T8. EventosPage + estado vacío + integración.** RF-1, RF-6, RF-7, RF-14
  - Hecho cuando: la página compone selector, gestión de lapsos, alta y lista
    de eventos, y muestra el estado vacío sin lapsos.

- [x] **T9. Cierre.** RNF-1…RNF-4
  - Hecho cuando: `pnpm lint`, `pnpm typecheck` y `pnpm test:run` en verde, y
    `MEMORY.md` actualizado.
