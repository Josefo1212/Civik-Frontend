# Spec 002 — Estudiantes (padrón)

Estado: implementada

## Contexto y objetivo

La API del backend para estudiantes es: `POST/GET /sections/{id}/students?incluir_inactivas=true`, `GET/PUT /students/{id}`, `POST /students/{id}/baja|reactivar`. Esta spec entrega la administración del padrón de una sección: listar (activos/inactivos), dar de alta, editar, dar de baja y reactivar. La vista "todos juntos" queda fuera de alcance hasta que el backend exponga `GET /students` (anotado).

## Usuarios

- Docente/administrador que administra el padrón de su sección.

## Historias de usuario

- HU-1. Como administrador, quiero ver los estudiantes de una sección, con opción de incluir a los dados de baja.
- HU-2. Como administrador, quiero dar de alta a un estudiante en la sección seleccionada.
- HU-3. Como administrador, quiero editar los datos del estudiante.
- HU-4. Como administrador, quiero dar de baja/reactivar un estudiante.
- HU-5. Como administrador, quiero cambiar de sección a un estudiante.

## Requisitos funcionales

- RF-1: CUANDO el usuario abre Estudiantes, EL SISTEMA le pide elegir una sección (selector) antes de mostrar el padrón.
- RF-2: CUANDO hay una sección seleccionada, EL SISTEMA muestra el listado de alumnos activos. Existe un toggle "Mostrar inactivos" que, al activarse, incluye también los alumnos dados de baja.
- RF-3: MIENTRAS carga el padrón, EL SISTEMA muestra un indicador; SI falla, muestra el error y permite reintentar.
- RF-4: CUANDO el usuario da de alta un alumno en la sección seleccionada con apellido, nombre y teléfono (opcional), EL SISTEMA lo agrega al padrón.
- RF-5: SI el backend rechaza el alta o la edición (400/409), EL SISTEMA muestra el mensaje y conserva lo escrito.
- RF-6: CUANDO el usuario edita un alumno, EL SISTEMA precarga sus datos (id_seccion, apellido, nombre, teléfono) y permite cambiarlo de sección.
- RF-7: CUANDO el usuario da de baja un alumno, EL SISTEMA deja de mostrarlo en el listado de activos (si el toggle no está activado) o lo marca como dado de baja (si está activado).
- RF-8: CUANDO el usuario reactiva un alumno, EL SISTEMA lo vuelve a mostrar como activo.
- RF-9: MIENTRAS una operación de escritura está en curso, EL SISTEMA deshabilita el control que la dispara.
- RF-10: SI la sección está inactiva (409), EL SISTEMA informa del error.

## Requisitos no funcionales

- RNF-1: Sin lógica de negocio propia. Errores se muestran tal cual desde el backend.
- RNF-2: Usable en móvil.
- RNF-3: Mantiene la convención: funciones flecha, import type, sin any. Respetar AGENTS.md.

## Casos límite

- Teléfono vacío/nulo → se guarda como null o string vacío? Backend espera opcional. Enviar vacío como null si procede.
- Cambiar de sección a un alumno → usa PUT /students/{id} con id_seccion nuevo.
- Padrón vacío → estado vacío explícito.
- 404 alumno no existe → mensaje + refresco.

## Fuera de alcance

- Vista "todos juntos" (GET /students) — pendiente del backend.
- Búsqueda global, filtros por apellido/nombre.

## Criterios de finalización

- Selector de sección obligatorio; padrón carga al seleccionar.
- Toggle incluir inactivos funciona.
- Alta/edición/baja/reactivar cubiertos con mensajes del backend.
- Tests de api + componente formulario, lint/typecheck/build en verde.
