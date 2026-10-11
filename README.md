# Civik — Frontend

PWA de **Civik** (instrucción premilitar): toma de asistencia desde el
teléfono, incluso sin internet, y administración desde la laptop.

Es el cliente de **Civik-Backend** (Rust + axum). **Este
repositorio no tiene lógica de negocio propia**: toda regla de dominio
(notas, elegibilidad, cancelación/reprogramación de eventos) se le pide al
backend; acá solo se muestra el resultado. Las únicas responsabilidades
propias son de presentación: el estado de sincronización y el armado y
vaciado del outbox offline.

## Stack

- **Vite + React + TypeScript** — SPA, sin Next.js ni SSR
- **React Router** — navegación
- **TanStack Query** — caché y estados de carga de la API
- **Dexie** — IndexedDB, cola offline de asistencia
- **vite-plugin-pwa** — service worker (Workbox)
- **Vitest + Testing Library + jsdom** — tests
- **ESLint** — lint

## Requisitos

- [pnpm](https://pnpm.io/)
- El backend levantado localmente (por defecto en `http://localhost:3000`).

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # apunta VITE_API_URL al backend
pnpm dev
```

La app queda en `http://localhost:5173`.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (HMR) |
| `pnpm build` | Chequeo de tipos + build de producción a `dist/` |
| `pnpm preview` | Sirve el build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc -b`, solo tipos |
| `pnpm test` | Vitest en modo watch |
| `pnpm test:run` | Vitest una vez (CI) |

Antes de dar una tarea por hecha: `pnpm lint`, `pnpm typecheck` y
`pnpm test:run` en verde.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API de Civik-Backend. En local, `http://localhost:3000`; en producción, el dominio Tailscale `https://<servidor>.<tailnet>.ts.net`. |

Copiá `.env.example` a `.env.local` (ignorado por git) para desarrollo.

## Estructura

Estructura híbrida: `features/` por flujo de negocio + carpetas
compartidas por tipo. El detalle completo está en [`AGENTS.md`](./AGENTS.md).

```
src/
├── app/          router y providers
├── pages/        un componente por ruta, sin lógica propia
├── components/   UI reutilizable entre features (incluye el layout)
├── api/          cliente HTTP base
├── hooks/        hooks reutilizables
├── constants/    constantes compartidas (rutas, labels)
├── styles/       estilos globales y tokens
└── test/         setup de tests
```

## Estado

Fase 0 (bootstrap) implementada: shell navegable con las cinco secciones
(secciones, estudiantes, eventos, asistencia, notas), cliente HTTP y
estado de conectividad. El avance vive en [`MEMORY.md`](./MEMORY.md) y las
specs en [`specs/`](./specs).

## Documentación

- [`AGENTS.md`](./AGENTS.md) — arquitectura, convenciones y decisiones
- [`docs/constitution.md`](./docs/constitution.md) — principios innegociables
- [`specs/`](./specs) — specs, planes y tareas (Spec-Driven Development)
- [`MEMORY.md`](./MEMORY.md) — estado entre sesiones

## Notas de despliegue

El backend solo permite CORS desde el dominio de producción de Vercel (los
previews no están permitidos). Al desplegar como SPA hace falta un rewrite
de todas las rutas a `index.html`.
