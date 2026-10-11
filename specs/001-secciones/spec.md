# Spec 001 — Secciones (administración)

Estado: implementada

## Contexto y objetivo

El backend ya expone el CRUD completo de secciones (grados `1ro`–`5to`,
turnos `MATUTINO`/`VESPERTINO`, subdivisión). Hoy `SeccionesPage` es un
placeholder. Esta spec entrega la administración de secciones desde la
laptop contra esa API.

Sin lógica de negocio: el catálogo de grados y turnos, la normalización y
las validaciones las aplica el backend; el front solo presenta el
formulario y muestra el mensaje de error que devuelve el servidor.

## Usuarios

- **Docente/administrador**: da de alta las secciones del año, las
  corrige y las retira cuando dejan de usarse.

## Historias de usuario

- HU-1. Como administrador, quiero ver las secciones activas y filtrarlas
  por grado, para ubicar la que busco.
- HU-2. Como administrador, quiero crear una sección, para dejarla
  disponible para el resto del sistema.
- HU-3. Como administrador, quiero editar una sección, para corregir sus
  datos.
- HU-4. Como administrador, quiero dar de baja y reactivar una sección,
  para retirarla sin borrar su historia.
- HU-5. Como administrador, quiero eliminar una sección sin estudiantes,
  para limpiar lo que se cargó por error.

## Definiciones

- **Sección**: combinación de grado, subdivisión y turno.
- **Activa / dada de baja**: una sección dada de baja no aparece en el
  listado de activas pero sigue existiendo y se puede reactivar.

## Requisitos funcionales

- RF-1: CUANDO el usuario abre Secciones, EL SISTEMA muestra el listado
  de secciones activas en el orden que devuelve el backend.
- RF-2: CUANDO el usuario elige un grado en el filtro, EL SISTEMA muestra
  solo las secciones de ese grado; SI elige "Todos", ENTONCES quita el
  filtro.
- RF-3: MIENTRAS el listado carga, EL SISTEMA muestra un indicador de
  carga; SI la consulta falla, ENTONCES muestra el error y ofrece
  reintentar.
- RF-4: CUANDO el usuario envía el alta de una sección con grado,
  subdivisión y turno, EL SISTEMA crea la sección y la deja visible en el
  listado.
- RF-5: SI el backend rechaza el alta o la edición (400 o 409), ENTONCES
  EL SISTEMA muestra el mensaje del backend y conserva lo que el usuario
  escribió en el formulario.
- RF-6: CUANDO el usuario abre la edición de una sección, EL SISTEMA
  muestra un formulario con sus valores actuales; al guardar, EL SISTEMA
  refleja los cambios en el listado.
- RF-7: CUANDO el usuario da de baja una sección, EL SISTEMA la marca
  como dada de baja en la pantalla, sin quitarla, y ofrece reactivarla.
- RF-8: CUANDO el usuario reactiva una sección, EL SISTEMA la vuelve a
  mostrar como activa.
- RF-9: CUANDO el usuario elimina una sección sin estudiantes, EL SISTEMA
  la quita del listado.
- RF-10: SI el backend rechaza la eliminación porque la sección tiene
  estudiantes (409), ENTONCES EL SISTEMA muestra el mensaje y no quita la
  sección.
- RF-11: MIENTRAS una operación de escritura está en curso, EL SISTEMA
  deshabilita el control que la disparó.

## Requisitos no funcionales

- RNF-1: El front no reimplementa reglas de dominio: el catálogo y la
  validación vienen del backend; los mensajes de error se muestran tal
  cual (constitución nº 1).
- RNF-2: La pantalla es usable en móvil.
- RNF-3: Sin errores en la consola del navegador.

## Casos límite

- Alta o edición con combinación grado/subdivisión/turno ya usada → 409:
  se muestra el mensaje del backend.
- Volver a dar de baja una sección ya dada de baja, o reactivar una ya
  activa → la respuesta es la sección sin cambios (idempotente): la
  pantalla queda coherente.
- Sección inexistente (404) → se muestra el mensaje y se refresca el
  listado.
- Filtro por un grado sin secciones → estado vacío explícito, no un
  listado vacío sin explicación.
- Backend no disponible → error con opción de reintentar.

## Fuera de alcance

- Ver y reactivar secciones dadas de baja en una sesión anterior: el
  backend todavía no lista inactivas (pedido anotado en el `AGENTS.md` de
  `Civik-Backend`). En esta fase, la reactivación alcanza a las bajas
  hechas en la sesión actual.
- Eliminar una sección que tiene estudiantes (el backend lo impide).
- Autenticación y permisos.

## Criterios de finalización

- Se listan las secciones activas, con filtro por grado y estado vacío.
- Se crea, edita, da de baja, reactiva (deshacer) y elimina una sección.
- Los errores del backend (400/404/409) se ven en pantalla y el
  formulario conserva lo escrito.
- Cubierto por tests de las funciones de API y del flujo de formulario,
  en verde, con `pnpm lint` y `pnpm typecheck` sin errores.

## Dudas abiertas

- Ninguna. Resueltas: baja/reactivar con deshacer en sesión; sin
  diálogos de confirmación para acciones destructivas; la vista de
  secciones inactivas de sesiones previas queda fuera de alcance hasta
  que el backend la exponga.
