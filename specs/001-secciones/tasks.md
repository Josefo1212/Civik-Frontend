# Tareas 001 — Secciones

Una tarea a la vez: test primero si es lógica, luego código, `pnpm test`
verde, `pnpm lint` sin warnings, marcar y **PARAR**.

- [ ] **T1. Ampliar el cliente HTTP.** RF-5, RF-10
  - Hecho cuando: `apiFetch` usa el `{ error }` del cuerpo como mensaje de
    `ApiError` (con respaldo si no es JSON), `apiSend` envía JSON y tolera
    `204`; `client.test.ts` cubre los tres casos, en verde.

- [ ] **T2. Tipo `Seccion` y constantes.** RF-1, RF-2, RF-4
  - Hecho cuando: existe `src/domain/seccion.ts` con el contrato exacto y
    `src/features/secciones/constants.ts` con `GRADOS` (`1ro`–`5to`) y
    `TURNOS`; `pnpm typecheck` limpio.

- [ ] **T3. Funciones de API del feature.** RF-1…RF-10
  - Hecho cuando: `listarSecciones`, `crearSeccion`, `editarSeccion`,
    `darDeBajaSeccion`, `reactivarSeccion` y `eliminarSeccion` llaman al
    método/ruta correctos; `api.test.ts` lo verifica y propaga el
    `ApiError`, en verde.

- [ ] **T4. Hooks de consulta y mutaciones.** RF-1, RF-3, RF-4…RF-10
  - Hecho cuando: `useSecciones` y `useSeccionMutations` existen, la clave
    es `['secciones', { grado }]` y cada mutación invalida esa clave al
    terminar.

- [ ] **T5. FormularioSeccion + tests.** RF-4, RF-5, RF-6, RF-11
  - Hecho cuando: `FormularioSeccion.test.tsx` verifica que envía los
    valores elegidos, muestra el error y deshabilita el botón mientras
    `enviando`, en verde.

- [ ] **T6. FiltroGrado y TablaSecciones.** RF-2, RF-6…RF-10
  - Hecho cuando: el filtro lista "Todos" + grados y la tabla muestra las
    filas con sus acciones y marca las dadas de baja en la sesión con
    botón de reactivar; `pnpm typecheck` limpio.

- [ ] **T7. Componer `SeccionesPage`.** RF-1…RF-11
  - Hecho cuando: la página une filtro, formulario y tabla, coordina el
    estado de "deshacer baja" y `pnpm build` compila.

- [ ] **T8. Validación y cierre.** RF-1…RF-11, RNF-1…RNF-3
  - Hecho cuando: con Chrome DevTools se recorre la spec (listar/filtrar,
    crear, editar, baja+deshacer, eliminar, 409 con estudiantes y error
    de backend) sin errores en consola, en vista móvil; la spec queda en
    `implementada` y `MEMORY.md` actualizado.
