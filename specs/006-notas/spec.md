# Spec 006 — Notas

Estado: implementada

## Contexto y objetivo

La nota de un lapso es el resultado que el instructor entrega al final del
período. El backend (Fase 8) ya la calcula: cada `AUSENTE` descuenta un
peso según el tipo de evento, con base 20, y admite un override manual.
La consulta es por lapso y sección:
`GET /lapses/{id_lapse}/sections/{id_section}/grades` devuelve, por
estudiante, `{ id_student, first_name, last_name, nota }`, donde `nota` es
un string (`"19.0"`, `"18.50"`) o `null` si no hay nada que calificar.

Esta fase construye **solo la vista**: elegir lapso y sección, pedir la
nota al backend y mostrarla, comunicando que mientras el lapso no está
cerrado la nota es **provisional**. El front no calcula ni redondea nada
(constitución nº 1): muestra el string que devuelve el backend.

## Usuarios

- Instructor (único usuario del sistema).

## Historias de usuario

- HU-1. Como instructor, quiero ver la nota de cada estudiante de una
  sección en un lapso, para entregar los resultados del período.
- HU-2. Como instructor, quiero que la app me avise que la nota todavía es
  provisional mientras el lapso no está cerrado, para no entregarla como
  definitiva.
- HU-3. Como instructor, quiero distinguir "todavía sin nota" de una nota
  cero, para no confundir un dato faltante con un resultado.

## Definiciones

- **Nota provisional**: mientras el lapso no está `CLOSED`, el cálculo solo
  cuenta los eventos ya transcurridos y puede bajar al agregarse los que
  faltan.
- **Nota definitiva**: al cerrar el lapso (`CLOSED`), el cálculo ya cuenta
  todos los eventos programados.
- **Sin nota**: el backend devuelve `nota: null` (no hay eventos elegibles
  y no hay override). No es 0.
- **Override**: nota fijada a mano; el backend la devuelve con dos
  decimales. El contrato **no** informa si un valor es override.

## Requisitos funcionales

- RF-1. CUANDO el usuario elige un lapso y una sección, EL SISTEMA pide
  `GET /lapses/{id_lapse}/sections/{id_section}/grades` y muestra una
  tabla con cada estudiante y su nota.
- RF-2. MIENTRAS el lapso seleccionado no esté `CLOSED`, EL SISTEMA
  muestra un aviso visible de que la nota es **provisional** (puede bajar
  cuando se agreguen los eventos que faltan).
- RF-3. CUANDO el lapso seleccionado está `CLOSED`, EL SISTEMA indica que
  la nota es **definitiva** (o deja de mostrar el aviso de provisional).
- RF-4. SI un estudiante tiene `nota: null`, ENTONCES EL SISTEMA muestra
  "Sin nota", visualmente distinto de una nota numérica (incluida `0`).
- RF-5. EL SISTEMA muestra la nota tal como la devuelve el backend, sin
  recalcularla, redondearla ni reformatearla de otro modo.
- RF-6. SI el lapso o la sección no existen (`404`), ENTONCES EL SISTEMA
  muestra el mensaje del backend y ofrece reintentar.
- RF-7. EL SISTEMA no consulta ni muestra nada hasta tener lapso **y**
  sección elegidos.
- RF-8. SI no hay lapsos o no hay secciones activas, ENTONCES EL SISTEMA
  muestra un estado vacío que lo explique.
- RF-9. MIENTRAS la consulta está en curso, EL SISTEMA muestra un
  indicador de carga; si falla por otro motivo, un error con reintento.

## Requisitos no funcionales

- RNF-1. El front **no** calcula la nota: la fórmula, los pesos, la
  elegibilidad y el redondeo viven en el backend (constitución nº 1).
- RNF-2. El aviso de provisional/definitiva es una regla de presentación
  pura (función `esNotaProvisional(estado)`), testeable sin DOM
  (constitución nº 3).
- RNF-3. Textos y comentarios en español (constitución nº 7).
- RNF-4. Sin caché offline: la vista de notas puede requerir conexión
  (constitución nº 2: solo la asistencia es offline).

## Casos límite

- Lapso sin eventos elegibles: todos los estudiantes salen "Sin nota".
- Sección sin estudiantes: tabla vacía con mensaje.
- Nota `0`: se muestra "0" (o "0.00"), nunca como "Sin nota".
- Lapso `PLANNED` (aún no `ACTIVE`): se trata como provisional (no
  `CLOSED`).
- Cambiar de lapso o de sección vuelve a consultar.

## Fuera de alcance

- Escribir/editar overrides: el backend no expone esa ruta todavía.
- Distinguir visualmente un override del cálculo automático: el contrato
  no indica si un valor es override (ver dudas abiertas).
- Nota final del año, promedio entre lapsos, exportar boletines.
- Consulta individual de la nota de un estudiante.

## Criterios de finalización

- RF-1 a RF-9 verificados: unitarios para la regla de provisional y la
  tabla; la consulta real se prueba con la API mockeada.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- Spec marcada `implementada`, `MEMORY.md` actualizado y commit de cierre.

## Limitaciones conocidas

- El contrato de `grades` no expone si una nota es un override. La skill
  `civik-dominio-frontend` pide marcarlo como "editado manualmente", pero
  con el endpoint actual solo se podría adivinar por los decimales. En
  esta fase **no** se marca el override; requiere que el backend agregue
  un campo (p. ej. `es_override`).
