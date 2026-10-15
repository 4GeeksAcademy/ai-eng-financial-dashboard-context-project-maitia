---
name: checks-testing
description: "Garantiza que los cambios de código cumplan con los estándares de calidad y testing del proyecto heredado. Actívala cuando el usuario pida preparar, revisar o validar una nueva funcionalidad o adición; antes de sugerir o confirmar que un cambio de código está completo; y cuando se modifiquen componentes clave de la UI del dashboard, endpoints de la API o lógica de negocio heredada."
---

# Checks-testing

## Objetivo

Verificar los cambios de código frente a las convenciones, contratos y pruebas del proyecto heredado. Seleccionar checks según el impacto del cambio, proteger el comportamiento financiero y de integración, y comunicar resultados con evidencia. Esta skill complementa las reglas específicas de frontend y backend; no las reemplaza.

## Instrucciones

1. **Revisar el contexto antes de evaluar.** Consulta `AGENTS.md`, las reglas de frontend (`.agents/rules/frontend.md`) y/o backend (`.agents/rules/backend.md`) según el área, el banco de memoria pertinente y la guía local `references/financial-dashboard-guide.md`. Revisa también las skills aplicables, especialmente accesibilidad o performance si el cambio las afecta.
2. **Delimitar el cambio.** Identifica los archivos, contratos, comportamientos y dependencias que han cambiado o podrían verse afectados. Separa implementación existente, comportamiento esperado y criterios nuevos propuestos.
3. **Elegir checks proporcionales.** Usa la matriz de la guía local para seleccionar pruebas dirigidas y checks generales. No ejecutes pruebas de integración costosas para cambios aislados si no aportan evidencia; sí inclúyelas cuando cambien arranque, proxy o comunicación entre servicios.
4. **Proteger comportamiento, no solo forma.** Añade o ajusta pruebas que verifiquen resultados, límites y estados relevantes. Un `200`, la forma de una respuesta o la compilación, por sí solos, no demuestran cálculos ni filtros correctos.
5. **Ejecutar cuando sea posible.** Corre los comandos adecuados en el entorno disponible. Usa el resultado real de la ejecución; no infieras que un check pasó porque existe un script o una prueba.
6. **Informar el estado de cada check.** Clasifica cada uno como `APROBADO`, `FALLIDO`, `NO EJECUTADO` o `BLOQUEADO`, e incluye comando y motivo. Distingue fallos introducidos por el cambio de fallos preexistentes solo cuando haya evidencia que permita atribuirlos.
7. **Cerrar con una conclusión calibrada.** Di `verificado` solo si los checks pertinentes pasaron y no quedan riesgos bloqueantes. En otro caso usa `parcialmente verificado` o `no verificado`, lista lo pendiente y no afirmes que el cambio está completo.
8. **Mantener el registro del proyecto.** Después de implementar o avanzar la validación, actualiza `memory-bank/progress-context.md` con lo realmente comprobado y lo pendiente. Actualiza los demás contextos solo si cambia el producto, la arquitectura, las dependencias, la estructura o los comandos.

## Input

Toma en cuenta, cuando estén disponibles:

- Petición, descripción del cambio o diff revisado.
- Archivos y áreas afectados: UI, lógica financiera, endpoint, contrato, configuración o integración.
- Comportamiento esperado y criterios de aceptación; marca explícitamente los que sean nuevos o estén sin acordar.
- Comandos ya ejecutados y sus salidas.
- Restricciones del entorno, como dependencias ausentes, permisos, servicios inaccesibles o falta de navegador.

Si faltan datos esenciales para establecer el comportamiento esperado, identifica la ambigüedad y solicita aclaración o deja el check como pendiente. No inventes requisitos de producto ni restricciones de API.

## Output esperado

Presenta un informe conciso con:

1. **Alcance revisado:** archivos, capas y comportamiento afectados.
2. **Plan de checks:** pruebas elegidas y por qué son pertinentes.
3. **Pruebas de regresión:** escenarios que se añadieron, ajustaron o siguen pendientes.
4. **Resultados:** estado por check, comando ejecutado y evidencia resumida.
5. **Bloqueos y riesgos residuales:** qué no pudo verificarse y por qué.
6. **Conclusión:** `verificado`, `parcialmente verificado` o `no verificado`, sin sobrestimar el nivel de confianza.

## Ejemplo

**Cambio:** añadir filtro de rango de fechas al dashboard.

**Plan:** comprobar en pruebas de frontend que se envían `start_date` y `end_date` como fechas ISO y que las entradas vacías no se serializan como parámetros; verificar que un resultado vacío conserva los KPI en cero y el estado vacío de los gráficos. Si se toca el filtrado de la API, añadir pruebas pytest para límites inclusivos y filtros combinados. Ejecutar Vitest, build y pruebas backend según el alcance; hacer un smoke test de Compose y proxy si se modifica la comunicación entre servicios.

**Informe esperado:** anotar el resultado real de cada comando. Si las pruebas unitarias pasan pero el proxy no se pudo comprobar, concluir `parcialmente verificado` y dejar la comprobación de integración como pendiente; no afirmar que la funcionalidad integral está verificada.

## Criterios de aceptación

La verificación de un cambio cumple esta skill cuando:

- Los checks se corresponden con las capas y riesgos afectados.
- Los cambios de lógica o contrato tienen pruebas de comportamiento relevantes, o la falta de ellas queda indicada como deuda/pending.
- Se distingue entre respuesta vacía, error de API y estado de carga cuando la UI afectada expone esos estados.
- Los checks seleccionados se ejecutaron o se documentaron como no ejecutados/bloqueados con motivo.
- Los fallos conocidos se contrastaron con el estado actual; no se suprimen ni se presentan como éxito.
- La conclusión refleja la evidencia disponible y enumera riesgos residuales.
- Se actualiza el contexto de progreso tras un avance, sin registrar como hecho una ejecución que no ocurrió.

## Estructura

- Esta skill: `.agents/skills/checks-testing/SKILL.md`.
- Guía específica del proyecto: `.agents/skills/checks-testing/references/financial-dashboard-guide.md`.
- Reglas relacionadas: `.agents/rules/frontend.md` y `.agents/rules/backend.md`.
- Registro del trabajo y de las validaciones: `memory-bank/progress-context.md`.

## Reglas

- **No declarar éxito por inspección estática:** una revisión de código no equivale a ejecutar tests, build, lint o smoke tests.
- **No ocultar fallos:** informa los resultados fallidos aunque sean preexistentes; atribuye su origen solo si hay evidencia comparativa suficiente.
- **No fabricar cobertura:** la existencia de tests no significa que se hayan ejecutado ni que cubran todos los casos.
- **No confundir vacío y error:** `[]` o cero movimientos son resultados posibles; errores HTTP y fallos de red son estados distintos.
- **No cambiar contratos unilateralmente:** los modelos Pydantic y tipos TypeScript deben mantenerse alineados cuando cambie una respuesta o petición.
- **No sobreprobar:** selecciona checks por impacto; la accesibilidad y el rendimiento siguen sus skills especializadas.
- **No asumir infraestructura disponible:** confirma que servicios, dependencias y herramientas requeridas existen antes de afirmar resultados.
- **No borrar la incertidumbre:** si un check no se ejecutó o no fue concluyente, déjalo explícito en la conclusión.
