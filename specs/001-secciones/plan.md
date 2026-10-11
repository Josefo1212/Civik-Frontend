# Plan 001 — Secciones

Spec: `spec.md` (borrador). Cubre RF-1 … RF-11.

## Alcance

Administración de secciones contra `/sections`. Se apoya en el cliente
HTTP existente, que se amplía para leer el mensaje de error del backend y
para enviar cuerpos JSON. Sin lógica de dominio propia.

## Cambios en código compartido

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/api/client.ts` | `apiFetch` lee `{ error }` del cuerpo en 4xx/5xx y lo usa como mensaje de `ApiError`; nuevo `apiSend<T>(path, method, body?)` (serializa JSON, cabecera `Content-Type`, tolera `204` sin cuerpo) | RF-5, RF-10 |
| `src/domain/seccion.ts` | Tipo `Seccion` con los nombres del contrato (`id`, `grade_level`, `section`, `shift`, `active`, `created_at`, `updated_at`) | RF-1 |

## Archivos que se crean (feature `secciones`)

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/features/secciones/constants.ts` | `GRADOS` (`1ro`–`5to`), `TURNOS`, etiquetas para el filtro y el formulario | RF-2, RF-4 |
| `src/features/secciones/api.ts` | `listarSecciones(grado?)`, `crearSeccion`, `editarSeccion`, `darDeBajaSeccion`, `reactivarSeccion`, `eliminarSeccion` | RF-1…RF-10 |
| `src/features/secciones/hooks/useSecciones.ts` | `useQuery(['secciones', { grado }])` | RF-1, RF-3 |
| `src/features/secciones/hooks/useSeccionMutations.ts` | `useMutation` de alta/edición/baja/reactivación/eliminación; invalida `['secciones']` al terminar | RF-4…RF-10 |
| `src/features/secciones/components/FormularioSeccion.tsx` | Formulario controlado (grado y turno con `select`, subdivisión con `input`); muestra el error y deshabilita al enviar | RF-4, RF-5, RF-6, RF-11 |
| `src/features/secciones/components/FiltroGrado.tsx` | `select` "Todos" + grados | RF-2 |
| `src/features/secciones/components/TablaSecciones.tsx` | Filas con acciones (editar, baja/reactivar, eliminar); marca las dadas de baja en la sesión | RF-6…RF-10 |
| `src/features/secciones/api.test.ts` | Tests de las llamadas (método, ruta, cuerpo, error) | RF-4…RF-10 |
| `src/features/secciones/components/FormularioSeccion.test.tsx` | Tests del formulario (valores, error, deshabilitado al enviar) | RF-5, RF-11 |

## Archivos que se modifican

| Archivo | Cambio | RF |
|---|---|---|
| `src/pages/SeccionesPage/index.tsx` | Reemplaza el placeholder: filtro + formulario + tabla; coordina el estado de "deshacer baja" | RF-1…RF-11 |
| `src/api/client.test.ts` | Tests nuevos: mensaje desde `{ error }`, `apiSend` con cuerpo y `204` | RF-5, RF-10 |

## Estado de UI

- **Datos de secciones** → TanStack Query (`useSecciones`, mutaciones).
  Clave `['secciones', { grado }]`.
- **Estado local de la página** (React `useState`): grado del filtro,
  sección en edición (`id | null`), y la lista de secciones dadas de baja
  **en esta sesión** para el deshacer (RF-7).
- No toca el outbox ni la sincronización (eso es la fase 4).

## Cómo se resuelve "deshacer en sesión" (RF-7, RF-8)

`GET /sections` no incluye las dadas de baja, así que la baja no puede
"quedarse" en el listado tras invalidar. La página mantiene, en estado
local, las secciones que el usuario dio de baja en la sesión y las
muestra junto a las activas, marcadas, con un botón **Reactivar** que
llama al endpoint de reactivación y las quita del estado local. Al
recargar, esas secciones ya no aparecen: para verlas hace falta que el
backend exponga el filtro de inactivas (anotado en `Civik-Backend`).

## Decisiones técnicas (y alternativa descartada)

- **Invalidar la query tras cada mutación** en vez de actualización
  optimista: con un 409 posible, el servidor es la verdad; reconstruir a
  mano arriesga mostrar algo que el backend rechazó.
- **Formularios controlados con `useState`**, sin librería: el stack no
  incluye una y el formulario es chico. `react-hook-form` descartado por
  peso extra.
- **Formulario en panel dentro de la página** (no modal): más simple y
  usable en móvil.
- **Tipo `Seccion` con los nombres exactos del contrato** (`grade_level`,
  `section`, `shift`) en vez de traducirlos: evita una capa que se
  desincronice (constitución nº 7).
- **Grados y turnos como constantes locales de presentación** para
  poblar los `select`; la validación real sigue siendo del backend (nº 1).

## Estrategia de tests

- `api/client.test.ts`: `apiFetch` toma el mensaje de `{ error }` en 400
  y cae a un mensaje genérico si el cuerpo no es JSON; `apiSend` arma
  método, cabecera y cuerpo, y devuelve `undefined` en `204`.
- `secciones/api.test.ts`: cada función llama al método y la ruta
  correctos, arma el cuerpo esperado y propaga el `ApiError`.
- `FormularioSeccion.test.tsx`: envía los valores elegidos, muestra el
  error recibido y deshabilita el botón mientras `enviando`.
- La composición (filtro, baja/deshacer, listado) se valida con Chrome
  DevTools junto con el resto de la spec.

## Riesgos

- El catálogo de grados/turnos en constantes del front puede
  desincronizarse del backend; se acepta porque el backend valida y su
  error enumera los admitidos. Si crece, se reevalúa exponer un catálogo.
