# Spec 007 — Listado global de estudiantes y secciones dadas de baja

Estado: implementada

## Contexto y objetivo

La spec 002 dejó explícitamente fuera de alcance la vista "todos juntos":
el único listado de estudiantes era `GET /sections/{id}/students` (padrón
por sección) y la pantalla obligaba a elegir una sección antes de ver nada.
El backend ya expone `GET /students` (global, con `incluir_inactivas`) y
`GET /sections?incluir_inactivas` (spec 011 del backend, "para que la PWA
arme la vista todos juntos"). Esta spec entrega esa vista: el padrón
completo de una sola vez, con la sección de cada estudiante, y la
posibilidad de ver y reactivar a los estudiantes y a las secciones dados
de baja.

## Usuarios

- Instructor (único usuario): consulta el padrón completo y administra las
  bajas.

## Historias de usuario

- HU-1. Como instructor, quiero ver a todos los estudiantes juntos, sin
  recorrer sección por sección, para tener el padrón completo a la vista.
- HU-2. Como instructor, quiero saber a qué sección pertenece cada
  estudiante, para ubicarlo dentro de su grado/turno.
- HU-3. Como instructor, quiero incluir o excluir a los estudiantes dados
  de baja, para reactivar a los que di de baja por error.
- HU-4. Como instructor, quiero buscar por nombre o apellido, para
  encontrar a un estudiante rápido.
- HU-5. Como instructor, quiero ver las secciones dadas de baja y poder
  reactivarlas, sin depender de la vista por sección.

## Definiciones

- **Vista "todos juntos"**: el listado global de estudiantes (`GET
  /students`), a diferencia del listado por sección.
- **Rótulo de sección**: la combinación legible `grado` + `letra` +
  `turno` (p. ej. "1ro A — Matutino"), derivada del listado de secciones;
  el backend devuelve por estudiante solo `id_section`.
- **Sección dada de baja**: una sección con `active = false`; requiere
  `GET /sections?incluir_inactivas=true` para aparecer.

## Requisitos funcionales

- RF-1: CUANDO el instructor abre la vista "todos juntos", EL SISTEMA
  muestra todos los estudiantes activos de todas las secciones, en el
  orden que devuelve el backend (canónico), cada uno con su rótulo de
  sección.
- RF-2: EL SISTEMA deriva el rótulo de sección de cada estudiante cruzando
  su `id_section` con el listado de secciones; SI la sección no está en el
  listado (por estar dada de baja y no estar incluida), ENTONCES EL SISTEMA
  muestra un rótulo de respaldo (p. ej. "Sección dada de baja") en vez de
  dejarlo vacío.
- RF-3: CUANDO el instructor activa "Mostrar inactivos", EL SISTEMA pide el
  listado global con `incluir_inactivas=true` y muestra también a los
  estudiantes dados de baja, marcados como inactivos.
- RF-4: CUANDO el instructor escribe en el buscador, EL SISTEMA filtra el
  listado ya cargado por nombre o apellido (subcadena, sin distinguir
  mayúsculas ni acentos), sin volver a pedir al backend.
- RF-5: CUANDO el instructor reactiva un estudiante inactivo desde la vista
  global, EL SISTEMA lo reactiva y refresca el listado.
- RF-6: CUANDO el instructor activa "Mostrar secciones dadas de baja", EL
  SISTEMA muestra también las secciones inactivas (dadas de baja), con su
  acción de reactivar.
- RF-7: SI el listado global está vacío (o el filtro del buscador no
  encuentra nada), ENTONCES EL SISTEMA muestra un estado vacío explícito,
  no un error.
- RF-8: MIENTRAS el listado global carga, EL SISTEMA muestra un indicador;
  SI la llamada falla, EL SISTEMA muestra el mensaje del backend y un botón
  para reintentar.
- RF-9: MIENTRAS una operación de escritura (reactivar estudiante o
  sección) está en curso, EL SISTEMA deshabilita el control que la dispara.

## Requisitos no funcionales

- RNF-1: Sin lógica de negocio propia. El orden y la composición del
  listado los da el backend; acá solo se cruza `id_section` con las
  secciones para mostrar el rótulo (presentación, no dominio).
- RNF-2: Usable en móvil (tabla con desplazamiento horizontal, como las
  vistas existentes).
- RNF-3: Convención del repo: funciones flecha, `import type`, sin `any`,
  export por defecto y con nombre en componentes, textos en español.
- RNF-4: Los estados de servidor van con TanStack Query; el buscador y los
  toggles son estado local de la vista.
- RNF-5: Cada RF de lógica (filtro del buscador, cruce de rótulo) queda
  cubierto con un test unitario; los RF de interacción se validan con
  Chrome DevTools.

## Casos límite

- Estudiante activo en una sección dada de baja: aparece en el listado
  global (su `active` es del estudiante) y su rótulo se marca como
  "Sección dada de baja".
- Dos secciones con el mismo grado y letra pero distinto turno: el rótulo
  incluye el turno para distinguirlas.
- Buscador sin resultados: estado vacío distinto del "no hay estudiantes".
- Incluir inactivos combinado con el buscador: el filtro aplica sobre el
  listado ya incluido.
- Un listado global sin estudiantes (base vacía): estado vacío, no error.
- Reactivar un estudiante cuya sección está dada de baja: la operación es
  sobre el estudiante; si el backend la rechaza, se muestra su mensaje.

## Fuera de alcance

- Búsqueda, filtrado o paginación en el backend (el buscador es del
  cliente sobre el listado cargado).
- Alta y edición de estudiantes desde la vista global (siguen en la vista
  por sección, spec 002).
- Alta, edición y borrado de secciones (spec 001); acá solo se listan
  (incluidas las dadas de baja) y se reactivan.
- Reporte de "pendientes" y cualquier cálculo de dominio: se le piden al
  backend si llega a existir.

## Criterios de finalización

- La vista muestra el padrón global con el rótulo de sección, el toggle de
  inactivos, el buscador y la reactivación de estudiante; y lista/reactiva
  secciones dadas de baja.
- RF cubiertos por test unitario o validación visual con Chrome DevTools,
  con el resultado registrado.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.
- `MEMORY.md` actualizado al cerrar la fase.

## Dudas abiertas

Resueltas en la clarificación del 2026-10-12:

- **Ubicación de la vista**: vive en la página Estudiantes como un modo
  ("Todos" vs "Por sección"); no se agrega una ruta nueva.
- **Secciones dadas de baja**: se listan y se pueden reactivar desde esta
  misma vista (RF-6), sin depender de la página Secciones.
