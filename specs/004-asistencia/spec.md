# Spec 004 — Asistencia online (Fase 3)

Estado: implementada

## Contexto y objetivo

La asistencia es la evidencia que define que un evento ocurrió y la materia
prima de la nota. El backend ya expone el registro y la corrección online:
`GET /events/{id}/attendance` (padrón del evento), `POST /events/{id}/attendance`
(registro en lote, upsert por par evento/estudiante) y
`PATCH /events/{id}/attendance/{student_id}` (corrección). Esta spec entrega la
Fase 3 del `AGENTS.md`: **pasar lista online desde el teléfono**, sin la cola
offline (esa es la Fase 4).

Sin lógica de negocio: la elegibilidad para escribir (evento `CANCELLED` o lapso
`CLOSED`), la validez de los estados, el padrón aplicable y el orden los decide
el backend. El front solo presenta el padrón y muestra los mensajes.

## Usuarios

- **Instructor**: pasa lista de un evento desde el teléfono mientras ocurre.

## Historias de usuario

- HU-1. Como instructor, quiero elegir el lapso y el evento para pasar lista.
- HU-2. Como instructor, quiero ver el padrón del evento con el estado de cada
  estudiante, distinguiendo a quién todavía no marqué.
- HU-3. Como instructor, quiero marcar a cada estudiante como presente, ausente
  o justificado y guardar toda la lista de una vez.
- HU-4. Como instructor, quiero corregir el estado de alguien y volver a
  guardar.

## Definiciones

- **Padrón del evento**: los estudiantes aplicables con su estado, o sin marcar
  (`state = null`). No es una lista de asistencias.
- **Sin marcar**: sin fila para el evento. No es `AUSENTE`; no está evaluado y
  no penaliza la nota. La interfaz debe distinguirlo.
- **Estado**: `PRESENTE`, `AUSENTE` o `JUSTIFICADO`.
- **Registrar**: crear las filas faltantes y actualizar las existentes (upsert)
  en una sola transacción. Una segunda pasada corrige, no duplica.

## Requisitos funcionales

- RF-1: CUANDO el usuario abre Asistencia, EL SISTEMA le pide elegir un lapso y
  luego un evento.
- RF-2: CUANDO el usuario elige un evento, EL SISTEMA muestra el padrón con, por
  cada estudiante, apellido, nombre y su estado o "Sin marcar".
- RF-3: MIENTRAS el padrón carga, EL SISTEMA muestra un indicador; SI falla,
  ENTONCES muestra el error y permite reintentar.
- RF-4: CUANDO el usuario marca a un estudiante con uno de los tres estados, EL
  SISTEMA refleja la selección en la pantalla.
- RF-5: CUANDO el usuario guarda la lista con al menos un estudiante marcado, EL
  SISTEMA registra los cambios en una sola petición y refresca el padrón con lo
  que devuelve el backend.
- RF-6: MIENTRAS una escritura está en curso, EL SISTEMA deshabilita el botón de
  guardar.
- RF-7: SI el backend rechaza el registro o la corrección (400 estado inválido,
  404 evento/estudiante inexistente, 409 evento cancelado, lapso cerrado o
  estudiante dado de baja), ENTONCES EL SISTEMA muestra el mensaje y conserva la
  selección hecha.
- RF-8: CUANDO el usuario cambia el estado de un estudiante ya marcado y vuelve
  a guardar, EL SISTEMA actualiza el estado (no crea una fila nueva ni borra).
- RF-9: SI el usuario elige un evento `CANCELLED`, EL SISTEMA no le permite
  registrarlo (la opción aparece deshabilitada en el selector).
- RF-10: SI todavía no hay lapsos o no hay eventos para el lapso elegido, EL
  SISTEMA muestra un estado vacío explícito, no un listado vacío sin
  explicación.
- RF-11: SI no hay cambios pendientes respecto del servidor, EL SISTEMA mantiene
  el botón de guardar deshabilitado.

## Requisitos no funcionales

- RNF-1: Sin lógica de negocio propia: el padrón, los estados válidos y los
  rechazos los decide el backend; los mensajes se muestran tal cual
  (constitución nº 1).
- RNF-2: Usable en móvil (el caso de uso principal es el teléfono): controles
  grandes y sin desbordes.
- RNF-3: Sin errores en la consola del navegador.
- RNF-4: Convención del repo: funciones flecha, `import type`, sin `any`,
  textos en español. Respetar `AGENTS.md`.

## Casos límite

- Evento sin estudiantes activos → el padrón puede incluir solo a quienes ya
  tienen fila; si queda vacío, estado vacío explícito.
- Evento `CANCELLED` → opción deshabilitada en el selector (RF-9).
- Lapso `CLOSED` → el backend rechaza al guardar con 409; se muestra el mensaje.
- Estudiante dado de baja que ya tiene asistencia → aparece en el padrón (el
  backend lo incluye) y se puede corregir, pero no registrar nuevo.
- Guardar sin marcar a nadie → el botón está deshabilitado.
- Backend no disponible → error con opción de reintentar.

## Fuera de alcance

- Cola offline y sincronización (Dexie, outbox, `/attendance/sync`) — Fase 4.
- Corrección individual por `PATCH` (la segunda pasada del registro la cubre).
- Reporte de "pendientes" (eventos pasados sin asistencia).
- Notas (Fase 5) y autenticación.

## Criterios de finalización

- Se elige lapso y evento, y se ve el padrón con estados o "Sin marcar".
- Se marcan alumnos y se guarda en una petición; el padrón refleja el resultado.
- Los errores del backend (400/404/409) se ven en pantalla y la selección se
  conserva.
- Cubierto por tests de la API y de la lista de asistencia, en verde, con
  `pnpm lint` y `pnpm typecheck` sin errores.

## Dudas abiertas

- Ninguna. La corrección se resuelve volviendo a guardar (upsert), sin usar el
  `PATCH` individual; el `PATCH` queda para la sincronización de la Fase 4 si
  hiciera falta.
