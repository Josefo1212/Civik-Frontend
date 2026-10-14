# Spec 008 — Sistema de diseño y rediseño de la interfaz

Estado: aprobada

## Contexto y objetivo

La app es funcional pero la capa visual es ad-hoc: casi todos los
componentes usan `style={{ … }}` inline, `global.css` tiene ocho variables
sueltas y solo dos archivos usan CSS Modules. No hay tokens, ni estados de
hover/foco consistentes, ni tema oscuro, ni transiciones. El resultado se
siente plano, inconsistente y poco profesional, sobre todo en el teléfono,
que es donde se toma asistencia.

Objetivo: introducir un sistema de diseño (tokens + componentes base con
CSS Modules), soporte de tema claro/oscuro, y rediseñar la cáscara
(`AppShell`) y una pantalla de referencia (Estudiantes) para fijar el look.
El resto de las pantallas se migra después, reusando el sistema.

## Usuarios

- Instructor: usa la PWA en el teléfono (toma de asistencia) y en la
  laptop (administración).

## Historias de usuario

- HU-1. Como instructor, quiero que la app se vea clara y ordenada, para
  encontrar rápido lo que busco.
- HU-2. Como instructor, quiero que funcione bien en el teléfono, para no
  pelear con la pantalla al tomar asistencia.
- HU-3. Como instructor, quiero poder usar la app de noche con tema oscuro,
  para no encandilarme.

## Definiciones

- **Token**: variable CSS con un valor del sistema (color, tipografía,
  espaciado, radio, sombra, transición).
- **Componente base**: primitivo de UI reutilizable (botón, tarjeta, campo,
  insignia, …) con su propio CSS Module.
- **Pantalla de referencia**: Estudiantes, donde se aplica el sistema
  completo antes de migrar el resto.

## Requisitos funcionales

- RF-1: EL SISTEMA ofrece un tema claro y uno oscuro, siguiendo la
  preferencia del sistema (`prefers-color-scheme`) y permitiendo forzarlo
  con un control en el encabezado; la elección persiste entre sesiones.
- RF-2: EL SISTEMA define los estilos a partir de tokens (color,
  tipografía, espaciado, radios, sombras, transiciones); ningún componente
  nuevo usa `style` inline para lo que ya cubre un token.
- RF-3: EL SISTEMA provee componentes base reutilizables: botón (con
  variantes), tarjeta, campos de formulario, insignia de estado, alerta,
  estado vacío, cargador y control segmentado.
- RF-4: EL SISTEMA rediseña la cáscara (marca, navegación, estado del
  servidor, sincronización) manteniendo las mismas rutas y etiquetas; en
  móvil la navegación pasa a una barra inferior.
- RF-5: EL SISTEMA rediseña la pantalla Estudiantes (modos "Por sección" y
  "Todos", buscador, toggles, tablas, alertas y estados vacíos) con el
  sistema, sin cambiar su comportamiento ni sus nombres accesibles.
- RF-6: EL SISTEMA anima las interacciones (hover, foco/foco-visible,
  aparición de contenido, cambio de tema, control segmentado), usando solo
  `transform`/`opacity` y propiedades declaradas — nunca `transition: all`.
- RF-7: SI el usuario tiene activado "reducir movimiento"
  (`prefers-reduced-motion: reduce`), ENTONCES EL SISTEMA desactiva las
  animaciones y transiciones no esenciales.

## Requisitos no funcionales

- RNF-1: Contraste AA en ambos temas para texto y controles.
- RNF-2: Foco visible (`:focus-visible`) en todo elemento interactivo.
- RNF-3: Sin regresión funcional: los RF de las specs 001–007 y sus tests
  siguen verdes; no se toca la lógica de negocio ni la de sincronización.
- RNF-4: Nombres accesibles (roles, labels, `aria-label`) intactos: los
  tests de páginas y componentes siguen pasando sin cambios.
- RNF-5: Funciona offline (sin dependencias que requieran red); `color-scheme`
  y el `theme-color` acompañan al tema.
- RNF-6: Convención del repo: funciones flecha, `import type`, sin `any`,
  export por defecto y con nombre; textos de interfaz en español.

## Casos límite

- Preferencia de tema sin elegir: se usa la del sistema y se sigue si el
  sistema cambia.
- `localStorage` no disponible: la app no rompe; cae a la preferencia del
  sistema.
- Contenido largo (nombres, teléfonos): trunca o envuelve sin romper el
  layout.
- Tabla en móvil: desplazamiento horizontal sin desbordar la página.
- Lista vacía y búsqueda sin resultados: estados vacíos distintos (spec
  007), ahora con el componente de estado vacío.

## Fuera de alcance

- Rediseño de las pantallas Secciones, Eventos, Asistencia y Notas (van en
  iteraciones siguientes, reusando el sistema).
- Cambios de lógica, de datos, de sync/outbox/Dexie o de la constitución.
- Internacionalización o cambio de idioma.
- Librerías de UI o de CSS externas (se mantiene CSS Modules).

## Criterios de finalización

- Tokens claro/oscuro, componentes base, `AppShell` y pantalla Estudiantes
  rediseñados.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes, sin
  romper los tests existentes.
- Validación visual con Chrome DevTools en claro, oscuro y móvil (375 px).
- `MEMORY.md` actualizado.

## Dudas abiertas

Resueltas en la clarificación del 2026-10-13:

- **Enfoque**: CSS Modules + tokens, sin dependencias nuevas.
- **Tema**: claro y oscuro.
- **Alcance de la primera entrega**: sistema + `AppShell` + pantalla
  Estudiantes; después se migra el resto.
