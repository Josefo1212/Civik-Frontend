# Spec 009 — Panel de estudiantes

Estado: implementada

## Contexto y objetivo

Hoy "Notas" es una ruta propia (`/notas`) que exige elegir lapso **y** sección
antes de mostrar nada, y la asistencia se consulta aparte en otra pantalla.
Esto parte en tres el trabajo de "mirar a un estudiante": ver su padrón
(Estudiantes), ver su asistencia (Asistencia) y ver su nota (Notas), sin que
nada se conecte.

Esta spec fusiona Notas dentro de Estudiantes para que, desde un mismo
listado, se pueda **expandir un estudiante** y ver, para el lapso
seleccionado, su asistencia evento por evento y su nota final — corrigiendo
una asistencia en el lugar cuando haga falta. Además, la raíz `/` deja de
redirigir a Secciones y pasa a ser un **dashboard** de resumen.

Objetivo: menos saltos de pantalla, un solo lugar para el detalle de un
estudiante, y un resumen general al entrar. La toma de asistencia diaria en
el teléfono queda **intacta** como pantalla aparte.

## Usuarios

- Instructor/administrador de escritorio: revisa el estado general y el
  detalle/corrección de un estudiante.
- Instructor de teléfono: toma asistencia del día (flujo que no cambia).

## Historias de usuario

- HU-1. Como instructor, quiero ver al entrar un resumen con el lapso activo
  y cuántos estudiantes activos tiene cada sección, para saber en qué estado
  está el año sin abrir cada pantalla.
- HU-2. Como instructor, quiero expandir un estudiante en el listado y ver su
  asistencia de todos los eventos del lapso seleccionado, para evaluar su
  situación sin cambiar de pantalla.
- HU-3. Como instructor, quiero corregir la asistencia de un estudiante ahí
  mismo, para arreglar un error sin ir a la pantalla de asistencia.
- HU-4. Como instructor, quiero ver la nota final del lapso junto a su
  asistencia, marcada como provisional si el lapso está activo, para no
  confundirla con una definitiva.

## Definiciones

- **Lapso seleccionado:** el lapso cuyos eventos y nota se están mostrando en
  el panel.
- **Provisional:** nota de un lapso que todavía no está `CLOSED` (es decir,
  `PLANNED` o `ACTIVE`); puede bajar cuando se agreguen los eventos que faltan
  del lapso. Se muestra con etiqueta, no solo el número. Solo un lapso `CLOSED`
  da una nota definitiva.
- **Pendiente:** evento pasado sin asistencia registrada para el estudiante
  (el backend no devuelve un estado para ese evento). No es una ausencia; se
  muestra distinto.
- **Corrección:** cambio del estado de asistencia de un estudiante en un
  evento. Nunca es un borrado.
- **Fila expandible:** la fila de un estudiante que, al abrirse, despliega sus
  eventos del lapso y su nota.

## Requisitos funcionales

**Dashboard (`/`)**
- RF-1: CUANDO el usuario entra a la raíz, EL SISTEMA muestra un dashboard de
  resumen en lugar de redirigir a Secciones.
- RF-2: EL SISTEMA muestra el lapso activo actual (identificación y fechas)
  como contexto del resumen.
- RF-3: SI no hay ningún lapso activo, ENTONCES EL SISTEMA lo indica
  explícitamente en el dashboard sin mostrar un lapso en blanco.
- RF-4: EL SISTEMA muestra, por cada sección, la cantidad de estudiantes
  activos que tiene.
- RF-5: SI una sección no tiene estudiantes activos, ENTONCES EL SISTEMA la
  muestra con conteo cero.
- RF-6: SI falla la carga de los datos del dashboard, ENTONCES EL SISTEMA
  muestra el error con una acción para reintentar.

**Fusión de Notas en Estudiantes**
- RF-7: CUANDO el usuario entra a Estudiantes, EL SISTEMA deja de ofrecer
  "Notas" como ruta navegable separada. La ruta `/notas` queda retirada (sin
  redirect): su contenido vive en el panel de Estudiantes.
- RF-8: CUANDO el usuario entra a Estudiantes, EL SISTEMA preselecciona el
  lapso activo cuando exista.
- RF-9: CUANDO el usuario abre la fila de un estudiante, EL SISTEMA muestra su
  asistencia para todos los eventos del lapso seleccionado y su nota final del
  lapso.
- RF-10: EL SISTEMA muestra la nota del lapso tal como la devuelve el backend,
  sin recalcularla ni reformatearla.
- RF-11: MIENTRAS el lapso seleccionado no esté cerrado, EL SISTEMA marca la
  nota como provisional.
- RF-12: SI la nota es un override, ENTONCES EL SISTEMA la marca como editada
  manualmente, sin mezclarla con el cálculo automático.
- RF-13: SI un estudiante no tiene nota para el lapso, ENTONCES EL SISTEMA lo
  muestra como "sin nota", distinto de cero.
- RF-14: EL SISTEMA lista los eventos del lapso, incluidos los cancelados,
  marcando estos últimos y mostrando su motivo.
- RF-15: SI el backend no devuelve estado de asistencia para el estudiante en
  un evento pasado, ENTONCES EL SISTEMA lo muestra como pendiente, no como
  ausencia.
- RF-16: SI el lapso seleccionado no tiene eventos, ENTONCES EL SISTEMA lo
  indica dentro de la fila expandida.
- RF-16b: EL SISTEMA combina la asistencia de todos los eventos del lapso con
  las correcciones aún no confirmadas, para un mismo estudiante, por evento.

**Corrección inline**
- RF-17: CUANDO el usuario cambia el estado de asistencia de un estudiante en
  un evento desde la fila expandida, EL SISTEMA registra la corrección por el
  mismo mecanismo de outbox y sincronización que usa la toma de asistencia: la
  encola primero y, si hay conexión, dispara la sincronización.
- RF-18: EL SISTEMA genera el identificador de la corrección una sola vez y no
  lo regenera en los reintentos.
- RF-19: SI el servidor rechaza la corrección por conflicto, ENTONCES EL
  SISTEMA mantiene la corrección encolada como no confirmada y le pide al
  usuario refrescar.
- RF-20: EL SISTEMA nunca elimina una asistencia; solo cambia su estado.

**No regresión**
- RF-21: EL SISTEMA preserva el funcionamiento actual de la toma de asistencia
  en el teléfono, sin fusionarla con el panel.

## Requisitos no funcionales

- RNF-1: El front no calcula reglas de negocio. La nota y las decisiones de
  dominio vienen del backend; el conteo del dashboard es presentación sobre
  listas ya disponibles.
- RNF-2: El sistema de diseño vigente se respeta: vidrio en chrome y paneles,
  superficie sólida en tablas y datos repetidos, el azul como único acento de
  acción, el rojo solo para errores, textos de interfaz en español.
- RNF-3: Se preservan nombres y roles accesibles existentes que la suite de
  tests verifica.
- RNF-4: Escritorio y móvil deben verse correctos; no hay paginación ni
  límites artificiales (se lista todo).

## Casos límite

- Sin lapso activo al entrar.
- Lapso `PLANNED` (nota provisional, aunque no sea el activo).
- Sección sin estudiantes activos.
- Lapso sin eventos.
- Estudiante sin ninguna asistencia en el lapso.
- Corrección registrada sin conexión.
- Corrección encolada que el servidor rechaza por conflicto.
- Nota con override frente a nota calculada.
- Lapso `CLOSED` (nota definitiva, sin marca de provisional).

## Fuera de alcance

- Modificar la pantalla de toma de asistencia y su sincronización offline.
- Cualquier regla de negocio (elegibilidad, reprogramación, recálculo de notas).
- Métricas agregadas o endpoints nuevos en el backend.
- Paginación o límites de listado.
- Crear/editar/cancelar eventos o lapsos desde el panel.

## Criterios de finalización

- Los RF se recorren uno por uno.
- Los RF de lógica (outbox/sync, derivación de estado provisional,
  preselección de lapso) tienen test unitario verde.
- Los RF visuales y de interacción se validan con Chrome DevTools en
  escritorio y móvil, con la consola limpia.
- `/notas` ya no es una ruta accesible desde la navegación.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.

## Dudas abiertas

Ninguna. El dashboard no lista secciones dadas de baja: solo secciones activas.
