# Regla de frontend

## Nombre
Frontend financiero: conservar la responsabilidad del cliente y el contrato del API.

## Objetivo
Mantener coherentes la consulta de datos, los cálculos del dashboard y los tipos compartidos con FastAPI.

## Alcance
`frontend/src/**`, especialmente `App.tsx`, `lib/financial-types.ts` y `lib/financial-utils.ts`.

## Justificación
El dashboard solicita movimientos a `/api/metrics` y calcula KPI y agregados mensuales en el cliente. Duplicar cálculos del backend o cambiar solo uno de los tipos del contrato puede producir métricas o datos incompatibles. Las utilidades tienen pruebas Vitest que fijan su comportamiento.

## Guía específica del proyecto
- Mantén en `financial-types.ts` los tipos TypeScript del contrato y actualízalos cuando cambien los modelos Pydantic de `backend/app/routes.py`.
- Reutiliza `computeKPIs` y `computeMonthlyData` para las métricas actuales; no dupliques su lógica en componentes.
- Al cambiar cálculos o formato, amplía `financial-utils.test.ts` con el comportamiento esperado.
- Comprueba que el periodo mostrado corresponda con las fechas recibidas: el encabezado actual indica 2024, pero el backend genera fechas relativas al año actual.
- Conserva el prefijo `/api` para las llamadas al backend, salvo que también actualices el proxy de Vite y la configuración relacionada.

## Ejemplo correcto e incorrecto
Correcto, siguiendo `App.tsx` y `financial-utils.test.ts`:

```ts
const response = await fetch(`${API_BASE_URL}/api/metrics`);
if (!response.ok) throw new Error(`Failed to fetch financial data: ${response.status}`);
const movements: FinancialMovement[] = await response.json();
const metrics = computeKPIs(movements);
```

Incorrecto: añadir otro cálculo de KPI dentro de un componente y no probarlo; eso duplica `computeKPIs` y permite que los resultados diverjan.
