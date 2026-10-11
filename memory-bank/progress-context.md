# Contexto de progreso

## Qué funciona en el proyecto

- Se contrastó la información del banco con la aplicación, utilidades y pruebas frontend, rutas y pruebas backend, manifiestos, Docker Compose y configuración de Vite. Se añadieron referencias a las afirmaciones de [product-context.md](product-context.md) y se corrigió en [tech-context.md](tech-context.md) el bloque Markdown que mezclaba comandos frontend y backend. Fue una auditoría documental; no se ejecutaron pruebas. Referencias: [App.tsx](../frontend/src/App.tsx), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [routes.py](../backend/app/routes.py), [test_routes.py](../backend/tests/test_routes.py), [package.json](../frontend/package.json), [docker-compose.yml](../docker-compose.yml), [vite.config.ts](../frontend/vite.config.ts).
- `AGENTS.md` ahora indica consultar los contextos de producto, tecnología y progreso antes de actuar, y mantener el banco de memoria actualizado en cada avance. Referencia: [AGENTS.md](../AGENTS.md).
- `App` consulta `GET /api/metrics`, gestiona carga y error, y pasa los datos a las utilidades de KPI y agregación mensual. Referencias: [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- La pantalla compone cuatro KPI, un gráfico mensual de ingresos frente a egresos y un gráfico mensual del porcentaje de beneficio; ambos gráficos contemplan carga y ausencia de datos. Referencias: [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).
- El backend define modelos tipados, genera 360 movimientos simulados ordenados y ofrece filtros, facetas, resúmenes, categorías principales, comparación, alertas y vistas B2B/B2C. Referencia: [routes.py](../backend/app/routes.py).
- Hay pruebas unitarias frontend para KPI, agregación mensual y formato, y pruebas backend para generación, orden, filtros y rutas principales. Referencias: [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [test_routes.py](../backend/tests/test_routes.py).
- Docker Compose define los servicios frontend y backend; Vite tiene un proxy `/api` hacia `backend:8000`. Referencias: [docker-compose.yml](../docker-compose.yml), [vite.config.ts](../frontend/vite.config.ts).

Estas referencias confirman implementación y existencia de pruebas; no implican que las pruebas se hayan ejecutado ni que el sistema se haya validado en ejecución.

## Limitaciones comprobables

- La fuente que genera el backend es simulada; las rutas llaman al generador con semilla fija y no hay en el código revisado una integración con una fuente financiera externa. Referencia: [routes.py](../backend/app/routes.py).
- El encabezado muestra el periodo fijo `2024 - Full Year`, mientras que las fechas se derivan de la fecha actual. Referencias: [App.tsx](../frontend/src/App.tsx), [dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx), [routes.py](../backend/app/routes.py).
- La pantalla consume `/api/metrics`; no se encontró consumo de las rutas analíticas de resumen, categorías, comparación o alertas en `App`. Referencias: [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py).
- La generación llama a `random.seed`, lo que modifica el estado aleatorio global. Referencia: [routes.py](../backend/app/routes.py).
- CORS permite cualquier origen, método y encabezado, y además habilita credenciales. Referencia: [main.py](../backend/app/main.py).
- Los tipos de movimiento TypeScript y el modelo Pydantic están escritos por separado; no existe un comando de generación de tipos en los scripts de frontend. Referencias: [financial-types.ts](../frontend/src/lib/financial-types.ts), [routes.py](../backend/app/routes.py), [package.json](../frontend/package.json).
- Algunas pruebas analíticas no validan el resultado numérico o filtro completo: la prueba de resumen B2C solo comprueba que el payload no esté vacío, y comparación valida principalmente las claves. Referencia: [test_routes.py](../backend/tests/test_routes.py).
- En esta actualización se revisó el código y las pruebas, pero no se ejecutaron tests, build ni lint; no hay resultados de ejecución nuevos que reportar. Comandos disponibles: [package.json](../frontend/package.json), dependencias de pruebas backend en [requirements.txt](../backend/requirements.txt).

## Siguientes pasos

1. Hacer que el periodo visible corresponda a las fechas recibidas y probar rangos dentro de un año, entre años y sin movimientos. Referencias a modificar/probar: [App.tsx](../frontend/src/App.tsx), [dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts).
2. Añadir pruebas de componente para petición, cálculos delegados a utilidades y estados de carga/error. Referencias: [App.tsx](../frontend/src/App.tsx), [package.json](../frontend/package.json).
3. Reforzar las pruebas backend con valores de respuesta esperados, filtros combinados y validación de parámetros inválidos; probar reproducibilidad y estado aleatorio global. Referencias: [routes.py](../backend/app/routes.py), [test_routes.py](../backend/tests/test_routes.py).
4. Decidir si se incorpora generación/verificación de tipos TypeScript desde OpenAPI para evitar deriva del contrato. Referencias: [routes.py](../backend/app/routes.py), [financial-types.ts](../frontend/src/lib/financial-types.ts), [package.json](../frontend/package.json).
5. Definir orígenes y permisos requeridos antes de restringir CORS; no asumir dominios permitidos. Referencia: [main.py](../backend/app/main.py).
6. Ejecutar las pruebas y controles disponibles tras los cambios: `cd frontend && npm test`, `cd frontend && npm run build`, `cd frontend && npm run lint` y `cd backend && python -m pytest`. Fuentes de comandos: [package.json](../frontend/package.json), [requirements.txt](../backend/requirements.txt).

## Posibles partes del proyecto derivadas del código

Estas son extensiones que las rutas o componentes existentes hacen posibles; no constan como funcionalidades actuales de la interfaz ni como requisitos confirmados.

- Añadir controles de fecha, categoría y tipo de operación usando filtros y facetas ya disponibles. Referencias: [routes.py](../backend/app/routes.py), [App.tsx](../frontend/src/App.tsx).
- Mostrar resúmenes por día o semana además del agregado mensual actual. Referencias: [routes.py](../backend/app/routes.py), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx).
- Incorporar vistas de categorías principales, comparación entre periodos o alertas de egresos. Referencias: [routes.py](../backend/app/routes.py), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx).
- Añadir una vista segmentada B2B/B2C, dado que la API expone rutas separadas y el modelo incluye `business_type`. Referencias: [routes.py](../backend/app/routes.py), [financial-types.ts](../frontend/src/lib/financial-types.ts).