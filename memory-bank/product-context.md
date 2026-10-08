# Contexto del producto

## Resumen

Panel web de métricas financieras con frontend React y TypeScript y API FastAPI. Presenta indicadores de ingresos, egresos, beneficio y porcentaje de beneficio, además de gráficos mensuales. Referencias: [App.tsx](../frontend/src/App.tsx), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx), [routes.py](../backend/app/routes.py).

El código revisado genera movimientos simulados en el backend; no se encontró en la ruta consultada por la pantalla una conexión a una fuente financiera externa. Referencias: [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py).

La pantalla actual consulta `/api/metrics` y calcula KPI y agregados mensuales en el frontend. La API también ofrece rutas para filtrar movimientos y consultar resúmenes, facetas, categorías principales, comparaciones y alertas. Referencias: [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [routes.py](../backend/app/routes.py).

## Alcance funcional confirmado

- Los movimientos incluyen fecha, importe, tipo de operación, categoría y tipo de negocio (B2B/B2C). Referencia: [routes.py](../backend/app/routes.py).
- El generador crea 360 movimientos: 30 por cada uno de 12 meses, y ordena los resultados por fecha. Referencias: [routes.py](../backend/app/routes.py), [test_routes.py](../backend/tests/test_routes.py).
- Las rutas analíticas permiten agrupar por día, semana o mes; consultar categorías principales; comparar periodos; y detectar aumentos de egresos. Referencia: [routes.py](../backend/app/routes.py).
- La interfaz visible actualmente muestra KPI y gráficos mensuales de ingresos frente a egresos y porcentaje de beneficio. Referencias: [App.tsx](../frontend/src/App.tsx), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

## Consideración sobre el periodo

El encabezado de la interfaz muestra `2024 - Full Year`, mientras que el backend construye fechas relativas al año actual y al anterior. No debe describirse el panel como un informe de datos reales de 2024 sin corregir esa discrepancia. Referencias: [App.tsx](../frontend/src/App.tsx), [dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx), [routes.py](../backend/app/routes.py).