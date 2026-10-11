# Plan 002 — Estudiantes

## Alcance

Administración del padrón por sección. Requiere tener el listado de secciones (ya tenemos feature secciones). Usa cliente HTTP ampliado (apiSend con error del body). No toca sincronización offline.

## Archivos compartidos

- `src/domain/estudiante.ts` — tipo `Estudiante` con nombres del contrato: `id, id_section, first_name, last_name, phone, active, created_at, updated_at`.
- El cliente HTTP ya soporta GET/POST/PUT/PATCH/DELETE y lectura de `{ error }` (T1 de 001).

## Feature `estudiantes`

| Archivo | Responsabilidad |
|---|---|
| `src/features/estudiantes/constants.ts` | textos/etiquetas si hace falta |
| `src/features/estudiantes/api.ts` | listarPorSeccion(seccionId, incluirInactivas), crearEnSeccion, editarEstudiante, darDeBaja, reactivar, cambiarSeccion? (editar ya permite id_seccion) |
| `src/features/estudiantes/hooks/useEstudiantes.ts` | query con key ['estudiantes', {seccionId, incluirInactivas}] |
| `src/features/estudiantes/hooks/useEstudianteMutations.ts` | mutaciones + invalidate |
| `src/features/estudiantes/components/SelectorSeccion.tsx` | selector de secciones activas para elegir padrón |
| `src/features/secciones/hooks/useSecciones.ts` | reutilizar (ya existe) |
| `src/features/estudiantes/components/FormularioEstudiante.tsx` | formulario con apellido/nombre/teléfono + selector de sección |
| `src/features/estudiantes/components/TablaEstudiantes.tsx` | listado con toggle vista inactivos |
| `src/features/estudiantes/api.test.ts` | tests |
| `src/features/estudiantes/components/FormularioEstudiante.test.tsx` | tests |

## Página

- `src/pages/EstudiantesPage/index.tsx` compone selector, toggle, formulario, tabla.

## Estado

- Server: TanStack Query.
- Local: seccionSeleccionadaId, mostrarInactivos (boolean), estudianteEditando (id|null), error general.

## Tests

- api.test.ts: rutas/métodos correctos (listar con incluir_inactivas, alta ruta /sections/:id/students, edición /students/:id).
- FormularioEstudiante.test.tsx: submit envía valores, muestra error, deshabilitado al enviar.

## Riesgos

- Edición permite cambiar de sección vía id_seccion (PUT /students/{id}) — confirmado por backend.

