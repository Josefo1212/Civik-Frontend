# Plan 008 — Sistema de diseño y rediseño de la interfaz

Estado: implementada

## Resumen

Sistema de diseño con tokens CSS y componentes base (CSS Modules), tema
claro/oscuro, y rediseño de la cáscara y de la pantalla de referencia
(Estudiantes). Sin dependencias nuevas. Toda la lógica y los nombres
accesibles se preservan.

## Archivos que se crean / modifican

### `src/styles/global.css` (reescribir)

- Tokens de color en `:root` (claro), `[data-theme='dark']` (oscuro) y
  fallback por `@media (prefers-color-scheme: dark)` cuando no hay
  preferencia forzada.
- Tokens de tipografía, espaciado, radios, sombras y transiciones.
- Reset/base: `color-scheme`, fondo/texto de `body`, `text-wrap: balance`
  en títulos, `scroll-behavior` suave (salvo con movimiento reducido).
- Bloque `@media (prefers-reduced-motion: reduce)` que apaga animaciones.
- Cubre RF-2, RF-6, RF-7, RNF-1.

### `src/components/ui/*` (nuevos; cada uno con `*.module.css` y test)

- `Button` — variantes `primary` / `secondary` / `ghost` / `danger`,
  tamaños `sm` / `md`, estado `cargando` con `Spinner`, foco-visible.
- `Card` — contenedor de superficie con encabezado opcional.
- `Spinner` — indicador de carga animado (con `prefers-reduced-motion`).
- `Badge` — insignia (`ok` / `danger` / `neutral` / `info`) para "Activo" y
  "Dado de baja".
- `Alert` — mensaje (`error` / `info` / `aviso`) con `role` adecuado.
- `EmptyState` — estado vacío (icono + mensaje).
- `Switch` — checkbox accesible estilizado (label + control, mismo hit
  target) para los toggles.
- `TextField` y `SelectField` — campo con `label`, control y error inline.
- `SegmentedControl` — selector de modo ("Por sección" / "Todos").
- `PageHeader` — `h1` + subtítulo + acciones.
- `Table` — envoltorio con desplazamiento horizontal y estilos de
  cabecera/filas (usa tokens).
- Cubre RF-3, RNF-2.

### `src/hooks/useTheme.ts` + `src/components/ThemeToggle/*` (nuevos)

- `useTheme`: tres valores (`claro` / `oscuro` / `sistema`), lee y persiste
  en `localStorage`, sigue `matchMedia('(prefers-color-scheme: dark)')`,
  aplica `data-theme` en `<html>` y sincroniza `<meta name="theme-color">`.
- `ThemeToggle`: botón con `aria-label` en el encabezado.
- Cubre RF-1.

### `src/components/AppShell/AppShell.tsx` + `.module.css` (modificar)

- Encabezado sticky con marca (logo + wordmark), navegación superior en
  desktop y acciones (ThemeToggle, SincronizarBoton, ServerStatus).
- En móvil (`≤ 640px`): la navegación pasa a una barra inferior fija, con
  íconos + etiqueta y la pestaña activa resaltada.
- Mismas rutas y etiquetas. Cubre RF-4.

### `src/components/ServerStatus/*` (modificar)

- Usar `Badge`/tokens; conservar `role="status"` y los textos.

### `src/sync/SincronizarBoton.tsx` (modificar, cosmético)

- Usar `Button`; conservar `aria-label`, comportamiento y textos.

### `src/components/NotFound/index.tsx` (modificar)

- Aplicar el sistema (`EmptyState` + `Card`).

### Pantalla Estudiantes (RF-5)

- `src/pages/EstudiantesPage/index.tsx`: `PageHeader`, `SegmentedControl`,
  `Card`, `Alert`, `EmptyState`, `Switch`, `TextField`; preservar labels
  (`buscar-estudiante`, `Mostrar inactivos`, …), roles y textos.
- `src/features/estudiantes/components/TablaEstudiantesGlobal.tsx` y
  `TablaEstudiantes.tsx`: `Table` con tokens, `Badge` de estado y `Button`s.
- `src/features/estudiantes/components/SelectorSeccion.tsx` y
  `FormularioEstudiante.tsx`: campos del sistema.
- `src/features/secciones/components/ListaSeccionesInactivas.tsx`: `Card` +
  `Button`.

### Tests

- Nuevos: `Button`, `Switch`, `SegmentedControl`, `EmptyState`, `useTheme`.
- Regresión: la suite existente (31 archivos) debe quedar verde sin cambios;
  sólo se ajusta un test si dependía de markup/estilo, no de a11y.

## Llamadas a `api/*`

Ninguna nueva. No cambia el contrato ni la lógica.

## Estado de UI

- Tema: hook `useTheme` (localStorage + `matchMedia`), fuera de TanStack.
- Sin cambios en el estado de datos (TanStack Query igual).

## Decisiones técnicas

- **CSS Modules + tokens**: respeta el stack, sin dependencias, funciona
  offline. Alternativa descartada: Tailwind (dependencia y build nuevos).
- **Tema por `data-theme` en `<html>`**: permite override manual y seguir el
  sistema; `localStorage` con fallback silencioso. Alternativa: sólo media
  query (no permite forzar).
- **Componentes base en `src/components/ui/`**, en inglés por ser patrones
  genéricos (AGENTS.md); componentes de dominio siguen en español.
- **Sin cambios de comportamiento**: los componentes base no tocan hooks de
  datos ni sync (constitución, principios 1 y 3).
- **Animación**: sólo `transform`/`opacity` y propiedades declaradas; nunca
  `transition: all`. `prefers-reduced-motion` apaga lo no esencial.

## Estrategia de tests

- Unitarios: primitivos (render, variantes, accesibilidad) y `useTheme`.
- Regresión: correr toda la suite por tarea.
- Visual: Chrome DevTools en claro, oscuro y móvil.

## Riesgos

- Romper nombres accesibles → tests rojos. Mitigación: preservar roles,
  labels y textos; correr la suite por tarea.
- Contraste insuficiente en oscuro. Mitigación: paleta AA + validación visual.
- Exceso de alcance: el resto de pantallas queda fuera de esta entrega.

## Cambio 2026-10-14 — Tema oscuro único + Liquid Glass

### Tema

- `src/styles/global.css`: `:root` pasa a ser solo oscuro (`color-scheme:
  dark`); se eliminan `[data-theme='dark']` y el `@media
  (prefers-color-scheme: dark)`. Se agregan tokens de vidrio
  (`--vidrio-fondo`, `--vidrio-borde`, `--vidrio-desenfoque`) y un fondo
  con degradado.
- Se eliminan `src/context/themeContext.ts`, `src/context/ThemeProvider.tsx`,
  `src/hooks/useTheme.ts`, `src/hooks/useTheme.test.tsx` y
  `src/components/ThemeToggle/*`. `providers.tsx` queda solo con
  `QueryClientProvider`; `AppShell` pierde el toggle.
- `index.html`: `data-theme="dark"` fijo, `theme-color` oscuro, sin script.
- `vite.config.ts`: `theme_color`/`background_color` del manifiesto a oscuro.

### Liquid glass

- Material: `background` translúcido + `backdrop-filter: blur(...)
  saturate(...)` + borde claro, aplicado por componente en su
  `*.module.css` (compatible con Safari vía `-webkit-backdrop-filter`).
- Afecta `Button` (secondary/ghost), `Card`, `Badge`, `Alert`,
  `EmptyState`, `Switch`, `SegmentedControl`, `TextField`, `SelectField`,
  `Table`, `AppShell` (encabezado y barra inferior), `ServerStatus` y
  `NotFound`.
- En móvil el encabezado no lleva `backdrop-filter` (contenedor de la nav
  `fixed`); el vidrio vive en la barra inferior.
- Alternativa descartada: utilidad global/clase compartida; se prefiere el
  token por componente para mantener el aislamiento de CSS Modules.

### Tests / validación

- Se elimina `useTheme.test.tsx`; la suite baja a 132 tests (sin tocar
  lógica). Validación visual en Chrome DevTools: oscuro escritorio y móvil
  375 px, consola limpia.
