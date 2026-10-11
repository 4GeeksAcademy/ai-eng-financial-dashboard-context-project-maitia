# Guía para agentes

Quienes trabajen en este proyecto **deben**:

- Consultar las reglas específicas del área antes de analizar o modificar código:
  - Frontend: `./.agents/rules/frontend.md`
  - Backend: `./.agents/rules/backend.md`

- Consultar  las **skills para agentes** disponibles en:  
  `./.agents/skills`

- Consultar el **banco de memoria del proyecto** antes de actuar, si existe:
  - Producto: `./memory-bank/product-context.md`
  - Tecnología: `./memory-bank/tech-context.md`
  - Progreso: `./memory-bank/progress-context.md`

Antes de actuar (analizar código, modificar archivos o generar resultados), revisar las reglas del área correspondiente y, si existen, las skills y los archivos del banco de memoria, para respetar las convenciones, el contexto y las restricciones operativas del proyecto.

Después de cada implementación o avance del proyecto, actualizar `./memory-bank/progress-context.md` con el estado comprobado y las validaciones realizadas. Actualizar también `product-context.md` si cambia el comportamiento o alcance del producto, y `tech-context.md` si cambian la arquitectura, las dependencias, la estructura o los comandos. Registrar como pendientes las tareas no realizadas y no presentar como exitosas pruebas que no se hayan ejecutado.
