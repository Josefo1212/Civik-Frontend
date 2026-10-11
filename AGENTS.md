# AGENTS.md — Civik Frontend

PWA de Civik (instrucción premilitar): toma de asistencia desde el
teléfono, incluso sin internet, y administración desde la laptop. Es el
cliente de `Civik-Backend` (Rust, ya construido). **Este repo no tiene
negocio propio.**

**Idioma:** los tipos de dominio (`Estudiante`, `Seccion`, `Lapso`,
`Evento`, `Asistencia`) usan el mismo vocabulario en español que el
backend, para que el contrato de la API sea 1:1 y no haya una capa de
traducción que se desincronice. Componentes, hooks y archivos siguen la
convención de React (inglés donde es un patrón genérico: `useSync`,
`EventList`). Textos de interfaz y comentarios en español.

## Relación con Civik-Backend — la regla que no se negocia

Este repo **nunca** calcula una nota, ni decide si un evento se puede
cancelar o reprogramar. Todo eso se le pide al backend; acá solo se
muestra el resultado. Las únicas dos cosas que sí son "lógica" de este
repo, porque son de presentación y no de dominio:
1. El estado de sincronización (pendiente / sincronizado / error).
2. El armado y vaciado del outbox offline.

La nota mostrada mientras un lapso está `ACTIVE` es **provisional** —
puede bajar cuando se agreguen los eventos que faltan del lapso. La
interfaz debe comunicarlo (una etiqueta, un tooltip), no mostrar solo el
número.

## Stack

```
Vite + React + TypeScript — SPA, sin Next.js, sin SSR
React Router
TanStack Query          — caché y estados de carga de las llamadas al backend
Dexie                    — IndexedDB, cola offline de asistencia
vite-plugin-pwa          — service worker (Workbox)
Vitest + Testing Library + jsdom — tests
ESLint                   — lint (formato: Prettier todavía no está decidido)
```

## Estilo de código

- **Funciones flecha, nunca `function`.** `const hacer = () => {}` en vez
  de `function hacer() {}`. La regla `func-style` de ESLint lo obliga;
  solo se exceptúan las clases (p. ej. `ApiError extends Error`).
- **Componentes React: exportación por defecto y con nombre**, en dos
  pasos para que el nombre sobreviva al build: `const Boton = () => <…>`
  y `export default Boton`. Hooks, utilidades y constantes: exportación
  nombrada.
- **`import type` para importar solo tipos** (`consistent-type-imports`),
  y **`any` prohibido** (`no-explicit-any` es error).
- **Sin comentarios** salvo que expliquen el *por qué*, no el *qué*.
- Textos de interfaz y comentarios en español; vocabulario de dominio en
  español (igual que el backend); patrones genéricos de React/TS en
  inglés.
- Antes de dar una tarea por hecha: `pnpm lint`, `pnpm typecheck` y
  `pnpm test:run` en verde.

## Config

`VITE_API_URL` apunta a `https://<servidor>.<tailnet>.ts.net` (la API vía
Tailscale). El backend solo permite CORS desde el dominio de producción de
Vercel — los previews de Vercel no están permitidos.

## Estructura

Híbrida: `features/` por flujo de negocio + carpetas compartidas por tipo,
para que cada cosa tenga un solo lugar obvio donde vivir. No crear una
carpeta hasta que haya código real que la llene — ninguna se crea "por si
acaso".

```
src/
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── router.tsx            definición de rutas
│   └── providers.tsx         QueryClientProvider, etc. — todo lo que envuelve <App/>
│
├── pages/                    un componente de página por ruta, sin lógica propia
│   ├── EstudiantesPage/
│   ├── SeccionesPage/
│   ├── EventosPage/
│   ├── AsistenciaPage/
│   └── NotasPage/
│
├── features/                 lógica y componentes propios de un flujo de negocio
│   ├── estudiantes/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api.ts
│   ├── secciones/
│   ├── eventos/
│   ├── asistencia/           toma de asistencia (UI + hooks propios)
│   └── notas/
│
├── sync/                     infraestructura offline, no es un feature de UI
│   ├── outbox.ts             cola de Dexie
│   └── syncManager.ts        idempotencia + resolución de conflicto
│
├── api/                      cliente HTTP base (fetch wrapper, baseURL, manejo de errores)
│                              — las llamadas específicas de cada feature viven en features/*/api.ts
│
├── domain/                   tipos que reflejan el contrato del backend (Estudiante, Seccion,
│                              Lapso, Evento, Asistencia) — es el "types/" pero solo para lo
│                              que viene de Civik-Backend
│
├── components/                componentes de UI reutilizables entre features (botones, inputs,
│                              layout). Si un componente solo lo usa un feature, vive en ese
│                              feature, no acá
├── hooks/                     hooks reutilizables entre features (useOnlineStatus, useDebounce)
├── context/                   contextos de React compartidos (ej. tema, si hiciera falta)
├── constants/                  constantes compartidas (rutas, límites, labels fijos)
├── utils/                      funciones puras compartidas (formateo de fechas, etc.)
├── styles/                     estilos globales / tokens de diseño
└── assets/                     imágenes, íconos
```

**Regla para decidir dónde va algo nuevo:**

| Pregunta | Va en |
|---|---|
| ¿Es un componente/hook que solo usa un flujo de negocio? | `features/<flujo>/` |
| ¿Lo usan dos o más features? | `components/` o `hooks/` (compartidos) |
| ¿Es un tipo que viene del backend? | `domain/` |
| ¿Es la página completa de una ruta? | `pages/` |
| ¿Es lógica de offline/sincronización, no UI? | `sync/` |

Un componente nace dentro de su `features/`; recién si otro feature lo
necesita, se promueve a `components/` compartido — no se adivina de
entrada si algo va a ser compartido.

## Offline y sincronización (resumen — detalle completo en la skill civik-dominio-frontend)

- El id de cada asistencia offline se genera en el cliente con
  `crypto.randomUUID()`, una sola vez, y nunca se regenera en un reintento.
- El outbox vive en Dexie; se vacía solo cuando el servidor confirma cada
  ítem.
- Conflicto: se compara contra lo almacenado, no es *last-write-wins*
  ciego.
- `navigator.storage.persist()` al instalar, para reducir el riesgo de que
  el navegador purgue IndexedDB.
- La app funciona offline recién después de la primera visita e
  instalación (el service worker necesita cachear el shell una vez con
  conexión).

## Reparto de responsabilidades

| Pregunta | Capa |
|---|---|
| ¿Cómo se ve esto en pantalla? | Componente de React |
| ¿Qué hago cuando pasa X? (reglas de UI: deshabilitar un botón, qué outbox usar) | hook o función en `features/*`, no en el componente |
| ¿Cómo le pido esto al backend? | `api/*` |
| ¿Es una regla de negocio real (notas, elegibilidad, reprogramación)? | **No vive acá.** Se le pide al backend |

## Orden de construcción (propuesto — ajustar contra lo que el backend ya expone)

| Fase | Qué se construye |
|---|---|
| 0 | Bootstrap: Vite+React+TS, router, cliente API mínimo, llamada de prueba a `/_health` |
| 1 | Administración: secciones y estudiantes (CRUD contra el backend) |
| 2 | Eventos: listar, crear manual, cancelar |
| 3 | Asistencia online (sin offline todavía) |
| 4 | PWA + offline: service worker, outbox de Dexie, sincronización |
| 5 | Notas: vista por lapso y sección, con el aviso de "provisional" |

No construyas una pantalla de algo que el backend todavía no expone —
confirmá contra el estado real de `Civik-Backend` antes de cada fase.
