---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en Civik Frontend (docs/constitution.md o cualquier archivo dentro de specs/) - redactar, revisar o cambiar specs, planes y tareas, o implementar y validar tareas de una spec.
---

# Spec-Driven Development (SDD) — Civik Frontend

## Flujo
Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio.

- Nunca pases a la siguiente fase sin la aprobación explícita del usuario.
- La spec manda: si algo no está en la spec, no se implementa. Si falta
  una decisión, para y pregunta.
- Un cambio de requisitos se hace primero en la spec, luego en el plan y
  las tareas, y por último en el código.
- Cada spec vive en su carpeta: `specs/NNN-nombre/` con `spec.md`,
  `plan.md` y `tasks.md`. `NNN` sigue el número de fase de la tabla "Orden
  de construcción" de `AGENTS.md` cuando aplica (ej. `001-secciones`,
  `004-offline-sync`).
- Al terminar cada fase, actualiza `MEMORY.md`.
- Toda spec, plan y tarea debe respetar `docs/constitution.md` y, si toca
  reglas de negocio que se muestran en pantalla, la skill
  `civik-dominio-frontend`.

## Plantilla de spec (spec.md)
```
# Spec NNN — <Nombre>

Estado: borrador | aprobada | implementada

## Contexto y objetivo
## Usuarios
## Historias de usuario
- HU-1. Como <rol>, quiero <acción> para <beneficio>.
## Definiciones (solo si hay términos que puedan interpretarse de varias formas)
## Requisitos funcionales
## Requisitos no funcionales
## Casos límite
## Fuera de alcance
## Criterios de finalización
## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>
```
La spec describe el QUÉ y el POR QUÉ. Nada de stack, arquitectura ni
nombres de archivos — eso va en el plan.

## Requisitos en EARS (en español)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: EL SISTEMA <comportamiento permanente>.

Cada RF debe ser verificable: con un test (Vitest) si es lógica, o con el
MCP de Chrome DevTools si es visual o de interacción. Nada de "rápido",
"bonito" o "intuitivo" sin un criterio medible (ej. "el botón queda
deshabilitado mientras la petición está en curso").

## Plan (plan.md)
Archivos que se crean/modifican y su responsabilidad · qué llamadas a
`api/*` necesita · qué estado de UI maneja (TanStack Query vs estado
local) · si toca el outbox o la sincronización · decisiones técnicas
justificadas (con su alternativa descartada) · estrategia de tests. Indica
qué RF cubre cada parte.

## Tareas (tasks.md)
```
- [ ] **Tn. <Descripción>.** RF-x, RF-y
  - Hecho cuando: <comprobación verificable>.
```
Máximo 20-30 min por tarea, en orden de dependencia. Si salen más de 10,
propón dividir la spec.

## Implementación
Una sola tarea cada vez: test primero (en rojo, con Vitest si es lógica),
después el código, `npm run test` en verde, `npm run lint` sin warnings,
marcar la tarea y PARAR. No empezar la siguiente.

## Validación
Recorre la spec RF por RF. Para un RF de lógica (sync, outbox, derivación
de estado), el test unitario es la prueba y su resultado con `npm run
test` lo confirma. Para un RF visual o de interacción (qué se ve, qué pasa
al tocar algo, cómo se ve en móvil), usa el MCP de Chrome DevTools: abrí
la pantalla, interactuá, revisá la consola por errores y comprobá la vista
móvil — igual que se hizo con el proyecto de ejemplo del curso.
