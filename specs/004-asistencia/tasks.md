# Tareas 004 — Asistencia online (Fase 3)

- [x] **T1. Dominio asistencia + constantes.** RF-2, RF-4
  - Hecho cuando: `domain/asistencia.ts` tipa `FilaPadron`/`EstadoAsistencia` y
    `features/asistencia/constants.ts` exporta estados y etiquetas.

- [x] **T2. API de asistencia + tests.** RF-2, RF-5, RF-8
  - Hecho cuando: `asistencia/api.test.ts` verifica `GET` del padrón y `POST`
    con el body `{ items }` en verde.

- [x] **T3. Hooks de asistencia.** RF-2, RF-5
  - Hecho cuando: `usePadron` (habilitado solo con evento) y
    `useRegistrarAsistencia` compilan e invalidan la key.

- [x] **T4. SelectorEvento + ListaAsistencia + tests.** RF-2, RF-4, RF-9
  - Hecho cuando: el selector deshabilita cancelados y la lista muestra "Sin
    marcar"/estado y notifica el cambio; test en verde.

- [x] **T5. PadronAsistencia + tests.** RF-5, RF-6, RF-7, RF-8, RF-11
  - Hecho cuando: el contenedor calcula cambios, deshabilita guardar sin
    cambios o enviando, y llama al registro con los ítems marcados; test en
    verde.

- [x] **T6. AsistenciaPage + estados vacíos.** RF-1, RF-3, RF-10
  - Hecho cuando: la página compone lapso, evento y padrón, con carga/error/
    reintentar y estados vacíos.

- [x] **T7. Cierre.** RNF-1…RNF-4
  - Hecho cuando: `pnpm lint`, `pnpm typecheck` y `pnpm test:run` en verde, y
    `MEMORY.md` actualizado.
