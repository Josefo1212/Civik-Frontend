# Plan 007 — Listado global de estudiantes y secciones dadas de baja

Estado: implementada

## Resumen

Un modo nuevo ("Todos") dentro de la página Estudiantes, al lado del modo
actual "Por sección". El modo global pide el listado a `GET /students`
(backend 011) y cruza `id_section` con las secciones para mostrar el
rótulo. Incluye un buscador del lado del cliente, un toggle de inactivos
de estudiantes y un bloque de secciones dadas de baja con reactivación.
No hay lógica de negocio: el orden lo da el backend; el front solo cruza y
filtra para presentar.

## Archivos que se crean / modifican

### `src/features/estudiantes/api.ts` (modificar)

- `listarTodos(incluirInactivas = false): Promise<Estudiante[]>` →
  `apiSend('/students' + (incluirInactivas ? '?incluir_inactivas=true' : ''),
  'GET')`. Cubre RF-1, RF-3.

### `src/features/estudiantes/hooks/useEstudiantes.ts` (modificar)

- `estudiantesQueryKeys.global(incluirInactivos)` =
  `['estudiantes', 'todos', { incluirInactivos }]`.
- `useEstudiantesGlobal(incluirInactivos)`: `useQuery` con esa key y
  `listarTodos`. TanStack Query maneja carga/error/reintento (RF-8).

### `src/features/secciones/api.ts` y `hooks/useSecciones.ts` (modificar)

- `listarSecciones(grado?, incluirInactivas = false)`: agrega
  `incluir_inactivas=true` a la query cuando corresponde (RF-2, RF-6).
- `seccionesQueryKeys.porGrado(grado, incluirInactivas)` y
  `useSecciones(grado, incluirInactivas = false)`. El parámetro por
  defecto conserva el comportamiento de los llamadores actuales
  (SeccionesPage, NotasPage), sin regresión.

### `src/features/secciones/utils.ts` (nuevo, puro) + test

- `etiquetaSeccion(seccion: Seccion): string` → `"{grade_level} {section}
  — {turno}"` (turno vía `ETIQUETAS_TURNO`, con respaldo al valor crudo).
  Cubre RF-2.
- Test: arma el rótulo con el turno traducido; dos secciones con igual
  grado/letra y distinto turno dan rótulos distintos (caso límite).

### `src/features/estudiantes/utils.ts` (nuevo, puro) + test

- `normalizar(texto: string): string` → minúsculas y sin acentos
  (`normalize('NFD')` + quitar diacríticos).
- `filtrarEstudiantes(estudiantes: Estudiante[], texto: string):
  Estudiante[]` → compara el texto normalizado contra
  `nombre_completo = "{first_name} {last_name}"` normalizado; texto vacío
  devuelve todo. Cubre RF-4 y el caso límite del buscador.
- Test: coincide por nombre y por apellido; ignora mayúsculas y acentos;
  texto vacío no filtra; sin coincidencias devuelve `[]`.

### `src/features/estudiantes/components/TablaEstudiantesGlobal.tsx` (nuevo) + test

- Props: `estudiantes: Estudiante[]`,
  `etiquetaPorSeccion: (id: string) => string`, `incluirInactivos: boolean`,
  `onReactivar: (id: string) => void`, `operandoId?: string | null`.
- Columnas: Apellido, Nombre, Teléfono, Sección (rótulo o respaldo de
  RF-2), Estado, Acciones (Reactivar si inactivo). Estado vacío propio
  (RF-7). Deshabilita el control mientras opera (RF-9).
- Test: fila activa e inactiva; el inactivo muestra "Reactivar" y dispara
  `onReactivar`; sección no resuelta muestra el rótulo de respaldo; vacío.

### `src/features/secciones/components/ListaSeccionesInactivas.tsx` (nuevo) + test

- Props: `secciones: Seccion[]` (solo inactivas),
  `onReactivar: (id: string) => void`, `operandoId?: string | null`.
- Lista las secciones dadas de baja con su rótulo y "Reactivar" (RF-6).
  Si no hay, no renderiza (o estado vacío breve).
- Test: muestra las inactivas y dispara `onReactivar` con el id.

### `src/pages/EstudiantesPage/index.tsx` (modificar)

- Estado local nuevo: `modo` (`'por-seccion' | 'todos'`, por defecto
  `'por-seccion'`), `incluirInactivosGlobal`, `textoBusqueda`,
  `operandoSeccionId`.
- Selector de modo (dos botones/pestañas "Por sección" | "Todos").
- En modo global: `useEstudiantesGlobal(incluirInactivosGlobal)`,
  `useSecciones(undefined, true)` (para resolver rótulos y listar las
  inactivas), `useEstudianteMutations().reactivar`,
  `useSeccionMutations().reactivar`. Buscador + toggle inactivos +
  `TablaEstudiantesGlobal` + `ListaSeccionesInactivas`.
- El modo "Por sección" queda igual que hoy (spec 002).
- RF-1 a RF-9.

### Tests de página

- Con `vi.mock` de `features/estudiantes/api` y `features/secciones/api`:
  cambiar a "Todos" muestra el padrón global con el rótulo de sección;
  el toggle de inactivos incluye al dado de baja; el buscador filtra;
  el error de la consulta muestra el reintento; reactivar un estudiante
  o una sección llama a la API.

## Llamadas a `api/*`

- `GET /students[?incluir_inactivas=true]` (estudiantes global).
- `GET /sections[?incluir_inactivas=true]` (rótulos + secciones dadas de
  baja).
- `POST /students/{id}/reactivar`, `POST /sections/{id}/reactivar`
  (ya existen en `features/*/api.ts`; se reusan vía las mutaciones).

## Estado de UI

- TanStack Query para los dos listados (carga/error/reintento).
- Estado local: modo, toggles, texto del buscador, `operandoId`.
- Sin outbox ni caché offline: es una vista de administración, no un flujo
  offline (constitución, principio 2).

## Decisiones técnicas

- **Rótulo derivado en el front**: el backend devuelve por estudiante solo
  `id_section`; el rótulo se arma cruzando con el listado de secciones
  (presentación, no dominio). Alternativa descartada: pedir al backend que
  incluya el rótulo (cambio fuera de este repo, backend 011 ya definido).
- **Buscador del cliente**: filtra el listado ya cargado. Alternativa
  descartada: buscador en backend (no existe, fuera de alcance).
- **Modo en la página Estudiantes**: reusa la ruta y el menú. Alternativa
  descartada: ruta nueva `/padron` (más superficie sin beneficio).
- **Secciones con `incluir_inactivas=true` siempre en el modo global**:
  así se resuelven los rótulos y se listan las dadas de baja; el toggle
  solo controla si se muestran. Alternativa descartada: pedir inactivas
  solo al activar el toggle (dejaría rótulos sin resolver).
- **`incluirInactivas` opcional** en `listarSecciones`/`useSecciones`:
  no rompe a los llamadores actuales.

## Estrategia de tests

- Puras: `etiquetaSeccion`, `normalizar`/`filtrarEstudiantes`.
- Componentes: `TablaEstudiantesGlobal`, `ListaSeccionesInactivas`.
- Página: con la API mockeada, el camino feliz, el toggle de inactivos, el
  buscador, el error y la reactivación.

## Riesgos

- El listado global sin estudiantes (base vacía) debe mostrar vacío, no
  error (RF-7).
- Sección no resoluble (estudiante en una sección borrada) cae al rótulo
  de respaldo (RF-2).
