# Spec 003 — Eventos (Fase 2)

Estado: implementada

## Contexto y objetivo

Los eventos son las actividades del lapso (prácticas regulares, prácticas
extra y presentaciones) sobre las que más adelante se toma asistencia y se
calculan notas. El backend ya expone el CRUD manual completo
(`POST/GET /events`, `GET/PATCH /events/{id}`, `POST /events/{id}/cancel`) y el
ciclo de vida de los lapso (`POST/GET /lapses`, `POST /lapses/{id}/activar`,
`POST /lapses/{id}/cerrar`).

Esta spec entrega la Fase 2 del `AGENTS.md`: **listar eventos, crear un evento
manual y cancelarlo con motivo** desde la laptop. Como un evento siempre
pertenece a un lapso (`id_lapse`), la pantalla incluye lo mínimo de lapsos para
que el flujo sea utilizable: listar, crear, activar y cerrar lapso.

Sin lógica de negocio: el rango de fechas, la regla del día de práctica, los
estados y la cancelación los decide el backend; el front solo presenta y
muestra los mensajes.

## Usuarios

- **Instructor/administrador**: organiza el calendario del período y cancela
  actividades que no se realizarán.

## Historias de usuario

- HU-1. Como instructor, quiero ver los lapsos con su estado para saber cuál
  es el vigente.
- HU-2. Como instructor, quiero crear un lapso, activar el que empieza y
  cerrar el que termina.
- HU-3. Como instructor, quiero elegir un lapso y ver sus eventos.
- HU-4. Como instructor, quiero registrar un evento manual (práctica regular,
  práctica extra o presentación).
- HU-5. Como instructor, quiero cancelar un evento indicando el motivo.

## Definiciones

- **Lapso**: período del año escolar (año, número 1–3, fechas, día de
  práctica) con estado `PLANNED`, `ACTIVE` o `CLOSED`.
- **Evento manual**: evento creado por el usuario (`source = MANUAL`). El
  backend también genera eventos `AUTO`; esta pantalla no los crea pero sí
  los lista.
- **Cancelar**: marcar un evento `SCHEDULED` como `CANCELLED` con un motivo
  obligatorio.

## Requisitos funcionales

- RF-1: CUANDO el usuario abre Eventos, EL SISTEMA muestra sus lapsos con
  estado y un selector de lapso.
- RF-2: CUANDO el usuario crea un lapso con año escolar, número, fechas y día
  de práctica, EL SISTEMA lo agrega al listado en estado `PLANNED`.
- RF-3: SI el backend rechaza el alta de un lapso (400/409), ENTONCES EL
  SISTEMA muestra el mensaje y conserva lo escrito en el formulario.
- RF-4: CUANDO el usuario activa un lapso `PLANNED`, EL SISTEMA lo muestra
  como `ACTIVE`; CUANDO lo cierra, EL SISTEMA lo muestra como `CLOSED`.
- RF-5: SI el backend rechaza activar o cerrar (409 por estado inválido o
  lapso activo existente), ENTONCES EL SISTEMA muestra el mensaje.
- RF-6: CUANDO el usuario elige un lapso, EL SISTEMA lista sus eventos en el
  orden que devuelve el backend.
- RF-7: MIENTRAS los eventos cargan, EL SISTEMA muestra un indicador; SI
  falla, ENTONCES muestra el error y permite reintentar.
- RF-8: CUANDO el usuario registra un evento manual con fecha, tipo y nombre,
  EL SISTEMA lo agrega al listado del lapso seleccionado.
- RF-9: SI el backend rechaza el alta del evento (400 fecha/tipo/nombre, 409
  fuera del lapso o fuera del día de práctica), ENTONCES EL SISTEMA muestra el
  mensaje y conserva lo escrito.
- RF-10: CUANDO el usuario cancela un evento `SCHEDULED` con un motivo no
  vacío, EL SISTEMA lo marca como `CANCELLED` y muestra el motivo junto al
  evento.
- RF-11: SI el backend rechaza la cancelación (409 por evento ya cancelado o
  con asistencia), ENTONCES EL SISTEMA muestra el mensaje y el evento queda
  igual.
- RF-12: CUANDO un evento está `CANCELLED`, EL SISTEMA no ofrece cancelarlo de
  nuevo y muestra siempre su motivo.
- RF-13: MIENTRAS una operación de escritura está en curso, EL SISTEMA
  deshabilita el control que la disparó.
- RF-14: SI no hay ningún lapso, EL SISTEMA muestra un estado vacío que invita
  a crear el primero en vez de un selector vacío.

## Requisitos no funcionales

- RNF-1: Sin lógica de negocio propia: reglas del lapso y de los eventos las
  aplica el backend; los errores se muestran tal cual (constitución nº 1).
- RNF-2: Usable en móvil (formularios y listados no desbordan la pantalla).
- RNF-3: Sin errores en la consola del navegador.
- RNF-4: Convención del repo: funciones flecha, `import type`, sin `any`,
  textos en español. Respetar `AGENTS.md`.

## Casos límite

- Sin lapsos → estado vacío con el formulario de alta disponible.
- Lapso `CLOSED` → no debería admitir eventos nuevos; el backend lo rechaza y
  el mensaje se muestra (no se oculta el formulario por adelantado para no
  duplicar la regla).
- Evento fuera del rango del lapso o práctica regular manual en un día
  distinto al `practice_day` → 409 con mensaje del backend.
- Motivo de cancelación vacío → el botón de confirmar queda deshabilitado.
- Evento ya cancelado seleccionado para cancelar → no se ofrece (RF-12).
- Backend no disponible → error con opción de reintentar.

## Fuera de alcance

- Editar un evento manual (`PATCH /events/{id}`) — fase posterior.
- Generación automática de prácticas y reprogramación de día de práctica.
- Tomar asistencia (Fase 3) y el estado "pendiente" de un evento pasado sin
  asistencia (necesita datos de asistencia).
- Editar y eliminar lapsos, y ver el detalle de un evento.
- Autenticación y permisos.

## Criterios de finalización

- Se listan, crean, activan y cierran lapsos, con mensajes del backend.
- Se elige un lapso y se listan sus eventos con estado y motivo de
  cancelación.
- Se crea un evento manual y se cancela con motivo obligatorio.
- Cubierto por tests de las funciones de API y de los formularios, en verde,
  con `pnpm lint` y `pnpm typecheck` sin errores.

## Dudas abiertas

- Ninguna. La gestión de lapsos vive dentro de la pantalla de Eventos (no se
  agrega una ruta nueva) porque es una dependencia directa del calendario y la
  navegación principal ya está fijada.
