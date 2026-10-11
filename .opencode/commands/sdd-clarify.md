---
description: SDD · Revisa la spec como un QA (solo detecta, no resuelve)
agent: plan
---
Revisa specs/$1/spec.md como si fueras un QA muy profesional. Usa la skill
sdd y, si la spec toca reglas de negocio que se muestran en pantalla, la
skill civik-dominio-frontend.

Lista:
1. Ambigüedades restantes (requisitos que no se pueden verificar).
2. Contradicciones entre requisitos.
3. Casos límite no cubiertos — en particular, contra lo que la skill
   civik-dominio-frontend dice que el front puede y no puede asumir.
4. Conflictos con docs/constitution.md.

No propongas soluciones todavía: solo detecta. Formato: lista numerada.
