# Tareas 008 — Sistema de diseño y rediseño de la interfaz

- [x] **T1. Tokens y base global.** RF-2, RF-6, RF-7, RNF-1.
  - `styles/global.css`: tokens de color (claro/oscuro), tipografía,
    espaciado, radios, sombras y transiciones; base con `color-scheme`,
    `text-wrap: balance` y bloque `prefers-reduced-motion`.
  - Hecho cuando: conmutar `data-theme` cambia los colores y la suite sigue
    verde (sin tocar componentes).

- [x] **T2. Componentes base del sistema.** RF-3, RNF-2, RNF-3.
  - `components/ui/`: `Button`, `Card`, `Spinner`, `Badge`, `Alert`,
    `EmptyState`, `Switch`, `TextField`, `SelectField`, `SegmentedControl`,
    `PageHeader`, `Table` (cada uno con su `*.module.css`).
  - Tests: render, variantes y accesibilidad de `Button`, `Switch`,
    `SegmentedControl`, `EmptyState`.
  - Hecho cuando: los tests de los primitivos pasan.

- [x] **T3. Tema claro/oscuro.** RF-1.
  - `hooks/useTheme.ts` (persistencia + `matchMedia` + `data-theme` +
    `theme-color`) + `components/ThemeToggle/` con `aria-label`.
  - Tests: `useTheme` aplica/lee la preferencia y cae a "sistema".
  - Hecho cuando: los tests de `useTheme` pasan.

- [x] **T4. Cáscara (AppShell) y estados globales.** RF-4, RF-6.
  - `AppShell` (encabezado sticky + navegación inferior móvil),
    `ServerStatus`, `SincronizarBoton` (cosmético) y `NotFound`.
  - Hecho cuando: la suite sigue verde y la navegación conserva rutas y
    etiquetas.

- [x] **T5. Pantalla Estudiantes rediseñada.** RF-5.
  - `pages/EstudiantesPage/index.tsx` y componentes de
    `features/estudiantes` y `ListaSeccionesInactivas` con el sistema,
    preservando labels, roles y textos.
  - Hecho cuando: `EstudiantesPage` y los tests de esos componentes siguen
    verdes y se ve con el sistema.

- [x] **T6. Animaciones y pulido.** RF-6, RF-7.
  - Transiciones de hover/foco, aparición de contenido, segmented control y
    switch; verificación de `prefers-reduced-motion`.
  - Hecho cuando: hay feedback en las interacciones y todo se desactiva con
    movimiento reducido.

- [x] **T7. Cierre de la entrega.**
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes.
  - Validación visual con Chrome DevTools en claro, oscuro y móvil (375 px);
    spec y tareas a `implementada`; `MEMORY.md` actualizado.
  - Hecho cuando: los cuatro comandos verdes y la validación registrada.

## Cambio 2026-10-14 — Tema oscuro único + Liquid Glass

- [x] **T8. Tema oscuro único.** RF-1 (reemplazado).
  - `global.css` solo oscuro; eliminar `ThemeToggle`, `ThemeProvider`,
    `useTheme`, `themeContext` y el script de `index.html`; `providers.tsx`
    y `AppShell` sin tema; manifiesto oscuro.
  - Hecho cuando: la app arranca en oscuro y la suite sigue verde.

- [x] **T9. Tokens y fondo de vidrio.** RF-8.
  - Tokens `--vidrio-*` y fondo con degradado en `global.css`, con fallback
    por `@supports not (backdrop-filter)` y `prefers-reduced-transparency`.
  - Hecho cuando: el fondo se ve y el vidrio tiene con qué refractar.

- [x] **T10. Vidrio en los componentes base.** RF-8.
  - `Button` (secondary/ghost), `Card`, `Badge`, `Alert`, `EmptyState`,
    `Switch`, `SegmentedControl`, `TextField`, `SelectField`, `Table`.
  - Hecho cuando: los primitivos se ven translúcidos en oscuro.

- [x] **T11. Vidrio en la cáscara y Estudiantes.** RF-8.
  - `AppShell` (encabezado + barra inferior), `ServerStatus`, `NotFound` y
    pantalla Estudiantes.
  - Hecho cuando: toda la interfaz usa el material.

- [x] **T12. Cierre del cambio.**
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes.
  - Validación visual en oscuro (escritorio y móvil 375 px); `MEMORY.md`
    actualizado.
  - Hecho cuando: los cuatro comandos verdes y la validación registrada.

## Cambio 2026-10-14 (b) — Pulido visual y animaciones

- [x] **T13. Fondo vivo.** RF-10.
  - `global.css`: aurora de degradados en `body::before` con animación
    `deriva` (26 s, solo `transform`) y capa de grano en `body::after`.
  - Hecho cuando: el fondo deriva suave detrás del contenido sin
    interceptar clics ni generar scroll.

- [x] **T14. Profundidad del vidrio.** RF-8 (refuerzo).
  - Borde degradado especular (borde de 1 px de luz) en `Card`; brillo
    superior interno en `Card`, `Table`, `SegmentedControl`, campos y
    `AppShell`.
  - Hecho cuando: las superficies tienen relieve y el borde de luz no
    aparece si el navegador no soporta `mask-composite`.

- [x] **T15. Microinteracciones y movimiento.** RF-11.
  - Entrada escalonada (`subir`/`entrar`/`bajar`), sheen al hover de
    botones, resaltado lateral en filas, rebote del interruptor, latido del
    indicador de servidor, títulos con degradado. Todo bajo `hover: hover`.
  - Hecho cuando: los movimientos se sienten suaves y no se pegan en móvil.

- [x] **T16. Cierre del cambio (b).**
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` (132) y `pnpm build`
    verdes.
  - Validación visual en escritorio y móvil 375 px, consola limpia;
    `MEMORY.md` actualizado.
  - Hecho cuando: los cuatro comandos verdes y la validación registrada.

## Cambio 2026-10-14 (c) — Paleta negro+morado, tabs deslizantes, inputs y errores

- [x] **T17. Paleta negro + morado.** RF-12.
  - Tokens en `global.css` (`--primario-rgb`, aurora morada, fondo negro,
    error rosa-violeta); reemplazo de glows azules por
    `rgba(var(--primario-rgb), …)` en todos los módulos; `theme-color` y
    manifiesto a `#050308`.
  - Hecho cuando: no queda azul/cian en los tokens ni en los módulos.

- [x] **T18. Acabado de inputs y listas desplegables.** RF-13.
  - Estilos base globales para `input`/`select`/`textarea` (incluidos los
    que no usan el UI kit), chevron propio en selects; `TextField` con
    error con ícono; `SelectField` con `error`/`ayuda`.
  - Hecho cuando: todos los controles se ven consistentes en oscuro.

- [x] **T19. Tabs con indicador deslizante.** RF-14.
  - Hook `useIndicadorDeslizante`; `SegmentedControl` y nav de `AppShell`
    con cápsula que se desliza; oculta en móvil; sin romper en `jsdom`.
  - Hecho cuando: el indicador se mueve suave y no aparece/desaparece.

- [x] **T20. Errores y cierre.** RF-15.
  - `Alert` con ícono y barra de acento; errores de campo con ícono;
    colores en línea de las pantallas sin migrar mapeados a tokens.
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` (132) y `pnpm build`
    verdes; validación visual; `MEMORY.md` actualizado.
  - Hecho cuando: los cuatro comandos verdes y la validación registrada.
