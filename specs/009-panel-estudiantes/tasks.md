# Tareas 009 — Panel de estudiantes

Ref: `spec.md` (aprobada) y `plan.md`. Una tarea por vez: test primero en
rojo si hay lógica, código después, verdes, marcar y PARAR.

- [x] **T1. Retirar Notas como ruta.**
  - Hecho cuando: `/notas` ya no existe en `router.tsx` ni en `RUTAS`/`NAVEGACION_PRINCIPAL`; `pages/NotasPage/` está borrada; `pnpm lint`, `pnpm typecheck` y `pnpm test:run` en verde (ajustando el test de nav/rutas si rompe).
  - RF-7.

- [x] **T2. Dashboard en `/`.**
  - Hecho cuando: `/` renderiza `DashboardPage` (no redirige); muestra el lapso activo con fechas; sin lapso activo lo indica; lista cada sección activa con su conteo de estudiantes activos (incluidos los de conteo cero); error de carga muestra Alert con "Reintentar".
  - `DashboardPage.test.tsx` en verde.
  - RF-1, RF-2, RF-3, RF-4, RF-5, RF-6.

- [x] **T3. Hook `useAsistenciaLapso`.**
  - Hecho cuando: dado un lapso y sus eventos, devuelve por estudiante el mapa `id_event → state` combinando `listarPadron` de cada evento con `listarPendientesDeEvento` (fusión con `fusionarPadron`); sin estado = pendiente para evento pasado; el test cubre N eventos, corrección encolada y conflicto.
  - `useAsistenciaLapso.test.tsx` en verde.
  - RF-9, RF-15, RF-16b.

- [x] **T4. Componente `FilaExpandible`.**
  - Hecho cuando: renderiza la tabla de eventos del lapso (fecha, nombre, tipo, estado), marca los cancelados con su motivo (sin control de corrección), marca los pendientes distinto de ausencia, muestra la nota con aviso provisional (`estado !== 'CLOSED'`), marca override y "sin nota"; con lapso sin eventos lo indica.
  - `FilaExpandible.test.tsx` cubre cada caso y está en verde.
  - RF-9, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16.

- [ ] **T5. Fila expandible + preselección de lapso activo en Estudiantes.**
  - Hecho cuando: al entrar a Estudiantes el lapso activo queda seleccionado si existe; hay selector de lapso; el botón de expandir en cada fila abre/cierra `FilaExpandible` sin romper buscador, toggles, modo por-sección/global ni los textos y roles accesibles existentes.
  - `pnpm test:run` en verde sin cambios en los tests de Estudiantes.
  - RF-7, RF-8.

- [ ] **T6. Corrección inline de asistencia.**
  - Hecho cuando: cambiar el estado en un evento `SCHEDULED` desde la fila llama a `useGuardarAsistencia.mutate` con `{ id_event, id_student, state }`; el ítem queda encolado con id de cliente (no se regenera) y, con conexión, dispara sync; el pendiente/error se refleja en la fila; un evento nunca se borra.
  - Test de lógica/render en verde cubriendo corrección y conflicto.
  - RF-17, RF-18, RF-19, RF-20.

- [ ] **T7. Limpieza de `features/notas` y MEMORY.md.**
  - Hecho cuando: se eliminan `components/AvisoNota*` y `components/TablaNotas*` (y sus tests); se conservan `utils.ts`, `constants.ts`, `hooks/useNotas.ts`, `api.ts` y sus tests (los usa el panel); no quedan imports huérfanos; `MEMORY.md` refleja el cierre de la fase.
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
  - RF-21 (no regresión).

## Validación (tras T1–T7)

- Recorrido RF a RF de la spec.
- Chrome DevTools: escritorio y móvil 375 px, consola limpia, foco de teclado en expandir/corregir; verificar `/notas` retirada y `/` como dashboard.
