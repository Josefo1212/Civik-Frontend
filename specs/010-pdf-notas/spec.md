# Spec 010 — PDF de notas

Estado: aprobada

## Contexto y objetivo

El instructor ya puede consultar la nota de cada estudiante en el panel de
alumnos (spec 009), pero no tiene forma de sacar ese listado de la app para
entregarlo, imprimirlo o archivarlo. Hoy la única salida es mirar la pantalla
o transcribir a mano.

Esta spec agrega la **generación de un documento PDF** con el listado de notas
del lapso seleccionado. El instructor elige si el documento es de **una
sección específica** o de **todas las secciones activas**, y lo descarga desde
la misma barra donde elige el lapso.

El front **no calcula notas**: el documento muestra la nota que ya devuelve el
backend (`GET /lapses/{id_lapse}/sections/{id_section}/grades`), tal cual
(constitución nº 1). Esta spec no modifica el backend.

## Usuarios

- Instructor/administrador de escritorio: arma y descarga el listado de notas
  para entregarlo.

## Historias de usuario

- HU-1. Como instructor, quiero generar un PDF con las notas del lapso, para
  entregar el listado sin transcribirlo a mano.
- HU-2. Como instructor, quiero elegir si el PDF es de una sección o de todas,
  para imprimir solo lo que necesito.
- HU-3. Como instructor, quiero que el PDF de todas las secciones salga en
  orden (1ro A, 1ro B, …, 5to), para que se pueda leer de corrido.
- HU-4. Como instructor, quiero que el PDF avise cuando la nota todavía es
  provisional, para no entregarla como definitiva.
- HU-5. Como instructor, quiero ver en el PDF el nombre, el apellido, el año,
  la sección y la nota final de cada estudiante.

## Definiciones

- **Alcance del PDF**: una sección específica o "Todas las secciones". Es
  independiente del filtro de sección del listado de alumnos.
- **Todas las secciones**: las secciones **activas** del lapso. Las secciones
  dadas de baja no entran al PDF.
- **Orden canónico**: primero por grado (`1ro`, `2do`, `3ro`, `4to`, `5to`) y,
  dentro de cada grado, por subdivisión (`a`, `b`, …). Dentro de cada sección,
  por apellido y luego por nombre.
- **Año**: el grado del estudiante (`grade_level`, p. ej. `1ro`). No es el año
  escolar.
- **Año escolar**: el `school_year` del lapso (p. ej. `2026`). Va en el
  encabezado del documento.
- **Nota final**: la nota del lapso que devuelve el backend, sin recálculo ni
  reformateo.
- **Provisional**: la nota de un lapso que no está `CLOSED` (es decir,
  `PLANNED` o `ACTIVE`); puede bajar cuando se agreguen los eventos que faltan.
- **Sin nota**: el backend devuelve `nota: null` (no hay eventos elegibles y no
  hay override). No es 0.
- **Override**: nota fijada a mano; el backend la devuelve con
  `es_override: true`.

## Requisitos funcionales

**Barra del PDF**
- RF-1: EL SISTEMA muestra, junto al selector de lapso, un contenedor con un
  selector de alcance (una sección o "Todas las secciones") y un botón
  "Generar PDF".
- RF-2: EL SISTEMA ofrece en el selector de alcance la opción "Todas las
  secciones" y cada sección activa, identificada por año y subdivisión.
- RF-3: SI no hay un lapso seleccionado, ENTONCES EL SISTEMA mantiene el botón
  "Generar PDF" deshabilitado y explica que falta elegir el lapso.
- RF-4: SI no hay secciones activas, ENTONCES EL SISTEMA mantiene el botón
  "Generar PDF" deshabilitado y lo explica.

**Contenido del documento**
- RF-5: CUANDO el usuario presiona "Generar PDF", EL SISTEMA descarga un archivo
  PDF.
- RF-6: EL SISTEMA incluye como encabezado el texto "Listado de notas de
  estudiantes de La Brigada del Valle año escolar {año escolar}".
- RF-7: EL SISTEMA incluye en el documento el lapso (número) y si la nota es
  provisional o definitiva.
- RF-8: SI el alcance es una sección, ENTONCES EL SISTEMA incluye solo los
  estudiantes de esa sección e indica el año y la subdivisión en el encabezado.
- RF-9: SI el alcance es "Todas las secciones", ENTONCES EL SISTEMA incluye las
  secciones activas en orden canónico, cada una con su encabezado de año y
  subdivisión.
- RF-10: EL SISTEMA lista, por cada estudiante, apellido, nombre, año, sección
  y nota final.
- RF-11: SI un estudiante no tiene nota, ENTONCES EL SISTEMA escribe "Sin nota"
  en la columna de nota, nunca 0.
- RF-12: EL SISTEMA muestra la nota tal como la devuelve el backend, sin
  recalcularla, redondearla ni reformatearla.
- RF-13: SI la nota es un override, ENTONCES EL SISTEMA la marca como editada
  manualmente y agrega la leyenda al pie.
- RF-14: MIENTRAS el lapso no esté cerrado, EL SISTEMA incluye en el documento
  el aviso de que la nota es provisional.

**Errores y estados**
- RF-15: SI falla la consulta de notas de alguna sección del alcance, ENTONCES
  EL SISTEMA no descarga un documento incompleto y muestra un error con
  reintento.
- RF-16: MIENTRAS arma los datos o genera el documento, EL SISTEMA muestra el
  botón en estado de carga y evita generar dos veces.
- RF-17: SI no hay estudiantes en el alcance elegido, ENTONCES EL SISTEMA lo
  indica y no descarga un documento vacío.
- RF-18: EL SISTEMA nombra el archivo con el año escolar, el lapso y, si
  aplica, el año y la subdivisión de la sección.
- RF-19: EL SISTEMA genera el documento sin enviar ni persistir datos en el
  backend; solo lee las notas existentes.

## Requisitos no funcionales

- RNF-1: El front no calcula la nota ni decide elegibilidad: usa el valor del
  backend (constitución nº 1).
- RNF-2: El armado de filas, el orden canónico y la decisión de
  provisional/definitiva son funciones puras, testeables sin DOM (constitución
  nº 3).
- RNF-3: El documento se lee bien en A4, con encabezado repetido y paginación;
  los acentos y la `ñ` del español se ven correctamente.
- RNF-4: La librería de PDF se carga bajo demanda, para no inflar el bundle
  inicial de la PWA.
- RNF-5: El contenedor, el selector y el botón respetan el sistema de diseño
  vigente (vidrio en el chrome, `Button`, `SelectField`, 375 px, foco visible,
  `prefers-reduced-motion`).
- RNF-6: Textos de interfaz y del documento en español (constitución nº 7).

## Casos límite

- Lapso sin secciones activas.
- Sección sin estudiantes.
- Todos los estudiantes sin nota (`null`).
- Lapso `PLANNED` (provisional, aunque no sea el activo).
- Lapso `CLOSED` (definitiva, sin aviso de provisional).
- Nombres con acentos, diéresis y `ñ`.
- Muchos estudiantes: el documento ocupa varias páginas.
- En modo "Todas las secciones", una sección falla al consultarse.
- Cambiar de lapso después de generar: el próximo documento usa el lapso
  vigente en pantalla.

## Fuera de alcance

- Cambios en el backend: no se agregan endpoints ni se modifica la fórmula.
- Boletín individual por estudiante.
- Promedio entre lapsos o nota final del año.
- Firmas, sellos, logos oficiales o formato con validez administrativa.
- Editar notas desde la app o desde el documento.
- Envío del documento por correo o almacenamiento en el servidor.

## Criterios de finalización

- RF-1 a RF-19 verificados: unitarios para el armado de filas, el orden
  canónico y la decisión de provisional/definitiva; el documento real se valida
  con Chrome DevTools (descarga, apertura y contenido) en escritorio y móvil.
- El PDF se genera sin errores de consola y con los acentos correctos.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- Spec marcada `implementada`, `MEMORY.md` actualizado y commit de cierre.

## Dudas abiertas

Ninguna. Las decisiones de alcance, orden y encabezado ya fueron definidas por
el usuario.
