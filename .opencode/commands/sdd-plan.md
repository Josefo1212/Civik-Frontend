---
description: SDD · Genera el plan técnico de una spec aprobada
agent: plan
---
Lee docs/constitution.md, AGENTS.md y specs/$1/spec.md. Usa la skill sdd.
NO escribas código.

Genera specs/$1/plan.md con: archivos que se crean o modifican y su
responsabilidad, qué llamadas a api/* necesita, qué estado de UI maneja
(TanStack Query vs estado local), si toca el outbox o la sincronización,
decisiones técnicas justificadas (con su alternativa descartada) y
estrategia de tests (Vitest para lógica, Chrome DevTools MCP para lo
visual).

Todo debe respetar la constitución y cubrir todos los RF. Marca qué RF
cubre cada parte. Si la spec no está aprobada o tiene dudas abiertas, para
y avísame.
