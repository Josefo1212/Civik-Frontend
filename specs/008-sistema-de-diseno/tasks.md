# Tareas 008 — Sistema de diseño y rediseño de la interfaz

- [ ] **T1. Tokens y base global.** RF-2, RF-6, RF-7, RNF-1.
  - `styles/global.css`: tokens de color (claro/oscuro), tipografía,
    espaciado, radios, sombras y transiciones; base con `color-scheme`,
    `text-wrap: balance` y bloque `prefers-reduced-motion`.
  - Hecho cuando: conmutar `data-theme` cambia los colores y la suite sigue
    verde (sin tocar componentes).

- [ ] **T2. Componentes base del sistema.** RF-3, RNF-2, RNF-3.
  - `components/ui/`: `Button`, `Card`, `Spinner`, `Badge`, `Alert`,
    `EmptyState`, `Switch`, `TextField`, `SelectField`, `SegmentedControl`,
    `PageHeader`, `Table` (cada uno con su `*.module.css`).
  - Tests: render, variantes y accesibilidad de `Button`, `Switch`,
    `SegmentedControl`, `EmptyState`.
  - Hecho cuando: los tests de los primitivos pasan.

- [ ] **T3. Tema claro/oscuro.** RF-1.
  - `hooks/useTheme.ts` (persistencia + `matchMedia` + `data-theme` +
    `theme-color`) + `components/ThemeToggle/` con `aria-label`.
  - Tests: `useTheme` aplica/lee la preferencia y cae a "sistema".
  - Hecho cuando: los tests de `useTheme` pasan.

- [ ] **T4. Cáscara (AppShell) y estados globales.** RF-4, RF-6.
  - `AppShell` (encabezado sticky + navegación inferior móvil),
    `ServerStatus`, `SincronizarBoton` (cosmético) y `NotFound`.
  - Hecho cuando: la suite sigue verde y la navegación conserva rutas y
    etiquetas.

- [ ] **T5. Pantalla Estudiantes rediseñada.** RF-5.
  - `pages/EstudiantesPage/index.tsx` y componentes de
    `features/estudiantes` y `ListaSeccionesInactivas` con el sistema,
    preservando labels, roles y textos.
  - Hecho cuando: `EstudiantesPage` y los tests de esos componentes siguen
    verdes y se ve con el sistema.

- [ ] **T6. Animaciones y pulido.** RF-6, RF-7.
  - Transiciones de hover/foco, aparición de contenido, segmented control y
    switch; verificación de `prefers-reduced-motion`.
  - Hecho cuando: hay feedback en las interacciones y todo se desactiva con
    movimiento reducido.

- [ ] **T7. Cierre de la entrega.**
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` verdes.
  - Validación visual con Chrome DevTools en claro, oscuro y móvil (375 px);
    spec y tareas a `implementada`; `MEMORY.md` actualizado.
  - Hecho cuando: los cuatro comandos verdes y la validación registrada.
