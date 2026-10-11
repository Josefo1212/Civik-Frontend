# Spec 000 — Bootstrap

Estado: aprobada

## Contexto y objetivo

El repositorio existe pero solo tiene el template de Vite sin navegación,
sin cliente de API y sin forma de comprobar que el backend responde. Esta
fase no entrega funcionalidad de negocio: entrega el esqueleto navegable
sobre el que se construirán las fases 1–5, y una prueba real de
conectividad contra `Civik-Backend` (que ya expone `/_health`).

El objetivo es poder abrir la app, moverse entre las secciones previstas y
ver si el servidor está disponible, sin rehacer infraestructura después.

## Usuarios

- **Desarrollador** (principal): necesita una base coherente con la
  estructura de `AGENTS.md` para colgar cada feature sin reorganizar.
- **Docente/administrador**: necesita abrir la app y saber si el sistema
  está operativo antes de confiar en él para tomar asistencia.

## Historias de usuario

- HU-1. Como desarrollador, quiero una app navegable con la estructura de
  carpetas prevista, para agregar cada fase sin rehacer infraestructura.
- HU-2. Como usuario, quiero ver que la aplicación carga y que puede
  comunicarse con el servidor, para saber si el sistema está disponible.

## Definiciones

- **Shell de la aplicación**: la estructura persistente (encabezado,
  navegación principal, área de contenido) que envuelve cada pantalla.
- **Estado de conectividad**: el resultado de consultar el backend:
  cargando, disponible o no disponible.

## Requisitos funcionales

- RF-1: CUANDO el usuario abre la aplicación, EL SISTEMA muestra el shell
  con la navegación principal hacia las cinco secciones (secciones,
  estudiantes, eventos, asistencia, notas).
- RF-2: CUANDO el usuario activa un destino de la navegación principal,
  EL SISTEMA muestra la pantalla correspondiente a esa ruta sin recargar
  la página, y la ruta queda reflejada en la barra de direcciones.
- RF-3: CUANDO el usuario abre una ruta que no existe, EL SISTEMA muestra
  una pantalla de "no encontrado" en lugar de una página en blanco.
- RF-4: CUANDO la aplicación arranca, EL SISTEMA consulta el estado del
  backend y muestra si el servidor responde.
- RF-5: MIENTRAS la consulta de estado está en curso, EL SISTEMA muestra
  un indicador de carga.
- RF-6: SI el backend responde con error o no responde, ENTONCES EL
  SISTEMA muestra un estado de "servidor no disponible" sin romper la
  interfaz ni bloquear la navegación.
- RF-7: EL SISTEMA obtiene la dirección del backend desde configuración de
  build, no escrita en el código.

## Requisitos no funcionales

- RNF-1: La aplicación arranca sin errores ni advertencias en la consola
  del navegador.
- RNF-2: La interfaz es usable en pantalla de móvil (viewport configurado,
  navegación accesible con el dedo).
- RNF-3: Ninguna pantalla calcula ni decide reglas de dominio
  (constitución, punto 1): esta fase no introduce lógica de negocio.

## Casos límite

- El backend responde lento: el indicador de carga permanece visible hasta
  obtener respuesta o error.
- El backend no está accesible (sin conexión o CORS no habilitado para el
  origen actual): se muestra "servidor no disponible" y la app sigue
  navegable.
- El usuario entra directo a una URL profunda (por ejemplo, la de eventos)
  sin pasar por la raíz: la app resuelve esa ruta correctamente.

## Fuera de alcance

- Service worker, caché offline y outbox de Dexie (fase 4).
- CRUD de secciones, estudiantes, lapsos, eventos y asistencia (fases 1–3).
- Vista de notas y aviso de "provisional" (fase 5).
- Autenticación: el backend no la expone.

## Criterios de finalización

- La app muestra el shell con la navegación a las cinco secciones.
- Se puede navegar entre las cinco rutas placeholder y a una 404, con la
  URL actualizada.
- Al abrir la app se consulta el backend y se ve un estado claro
  (cargando / disponible / no disponible), verificado primero con el
  backend caído y luego levantado.
- Existe una prueba automatizada del cliente de API (respuesta exitosa y
  error) en verde, y `npm run lint` sin warnings.

## Dudas abiertas

- Ninguna. Resueltas: la navegación principal son las cinco secciones
  (secciones, estudiantes, eventos, asistencia, notas) y el estado de
  conectividad se muestra de forma persistente en el shell.
