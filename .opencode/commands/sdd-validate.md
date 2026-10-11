---
description: SDD · Valida la spec RF por RF (npm test + Chrome DevTools)
agent: build
---
Recorre specs/$1/spec.md requisito por requisito. Para cada RF de lógica,
indica qué test lo cubre y el resultado de `npm run test`.

Para un RF visual o de interacción que no quede cubierto por un test,
verifícalo con el MCP de Chrome DevTools (incluida la vista móvil de 375
px de ancho): abrí la pantalla, interactuá, revisá la consola por
errores.

Si algún RF no está cubierto o falla, dilo claramente. NO arregles nada
todavía. Después comprueba los criterios de finalización y dame un
veredicto: ¿la spec está cumplida?
