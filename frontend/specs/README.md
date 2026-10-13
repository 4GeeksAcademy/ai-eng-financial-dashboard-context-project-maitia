# Guía de implementación de funcionalidades financieras

Esta guía agrupa las tres funcionalidades descritas en [`components.md`](./components.md) y separa el comportamiento que ya existe en el frontend de las capacidades disponibles solo en la API. Los contratos de endpoints se contrastaron con la documentación interactiva [`/docs`](http://localhost:8000/docs), el esquema servido en [`/openapi.json`](http://localhost:8000/openapi.json) y las definiciones de [`backend/app/routes.py`](../../backend/app/routes.py).

> **Cómo usar esta guía:** los apartados identifican explícitamente qué es contrato de API, qué está implementado en frontend y qué se propone como criterio de aceptación para una UI futura. Las propuestas de presentación (por ejemplo, texto de empty state) no son requisitos de `/docs`, pero sí una recomendación concreta para evitar decisiones abiertas durante la implementación.
>
> **Alcance actual:** la pantalla implementada consume solo `GET /api/metrics`. Alertas y capacidades analíticas de las funcionalidades 2 y 3 no tienen integración visual identificada. Los comportamientos sugeridos para esas vistas son criterios futuros y no describen funcionalidad ya existente.

## Tipos compartidos y convenciones

### Tipos ya existentes en TypeScript

- [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts): `FinancialMovement`, `OperationType`, `Category`, `BusinessType`, `KPIMetrics` y `MonthlyDataPoint`.
- [`./param-types.ts`](./param-types.ts): `DateRangeFilter`, `AlertsParams` y `TopCategoriesParams`.
- [`./api-types.ts`](./api-types.ts): `FacetsResponse`, `AlertEntry` / `AlertsResponse`, `CategoryEntry` / `TopCategoriesResponse` y tipos de facetas.

Los nombres TypeScript de las respuestas de la API solo están implementados para las rutas indicadas en esos archivos. Para los contratos sin un tipo TS propio, la tabla muestra la forma del modelo Pydantic que debe usarse al implementar la integración; esos nombres descriptivos no son interfaces TypeScript existentes.

### Tipos de dominio de la API

| Tipo | Forma/valores documentados |
|---|---|
| `OperationType` | `'income' \| 'outcome'` |
| `Category` | `'suppliers' \| 'sales' \| 'operational' \| 'administrative' \| 'others'` |
| `BusinessType` | `'B2B' \| 'B2C'` |
| `FinancialMovement` | `{ create_date: string; amount: number; operation_type: OperationType; category: Category; business_type: BusinessType }`; `create_date` representa una fecha ISO. |
| Fechas de query | Strings de fecha ISO `YYYY-MM-DD`; las fechas de filtros son inclusivas. En TypeScript se representan como `string`. |

## Funcionalidad 1 — Resumen financiero y filtro de fechas

### Endpoint consumido actualmente

`GET /api/metrics` devuelve un array de movimientos (`FinancialMovement[]`). En el dashboard, `App` envía únicamente `start_date` y/o `end_date`; aunque la API también soporta `category` y `operation_type`, esos filtros no se envían desde la pantalla actual. La ruta está definida en `backend/app/routes.py` y la llamada en [`../src/App.tsx`](../src/App.tsx).

### Tipos TypeScript

| Uso | Tipo | Estado |
|---|---|---|
| Respuesta del endpoint | `FinancialMovement[]` | Existe en `../src/lib/financial-types.ts`; corresponde al modelo Pydantic `FinancialMovement`. |
| Query de fechas | `DateRangeFilter` (`start_date?: string`, `end_date?: string`) | Existe en `./param-types.ts`. `App` mantiene valores de input como strings y construye la URL directamente. |
| Tipos de filtros adicionales de `/api/metrics` | `Category`, `OperationType` | Existen en `../src/lib/financial-types.ts`; no hay un tipo de parámetros unificado que incluya estos dos filtros. No se usan en el formulario actual. |
| Datos derivados de UI | `KPIMetrics`, `MonthlyDataPoint[]` | Son tipos frontend derivados, no respuestas de `/api/metrics`; las utilidades `computeKPIs` y `computeMonthlyData` los producen. |

### Parámetros, valores y restricciones

| Parámetro | ¿Lo envía la UI actual? | Reglas verificadas |
|---|---:|---|
| `start_date` | Sí, opcional | Fecha ISO `YYYY-MM-DD`; límite inclusivo. Puede omitirse. |
| `end_date` | Sí, opcional | Fecha ISO `YYYY-MM-DD`; límite inclusivo. Puede omitirse. |
| `category` | No | Opcional; valores: `suppliers`, `sales`, `operational`, `administrative`, `others`. |
| `operation_type` | No | Opcional; valores: `income`, `outcome`. |

La API no declara una restricción de orden entre `start_date` y `end_date`. El frontend tampoco valida esa relación. No añadir una regla o mensaje de validación como si formara parte del contrato sin acordar ese requisito.

### Casos límite de UI

1. **Ambas fechas vacías:** la implementación actual omite ambos parámetros y solicita `/api/metrics`. Debe mostrar los resultados del endpoint sin acotar por fecha; si la respuesta es `[]`, los KPI se calculan sobre lista vacía y ambos gráficos presentan su estado vacío (`No data available to display`).
2. **Rango que devuelve cero movimientos:** si la respuesta es `[]`, la UI debe conservar la estructura del dashboard, presentar KPI calculados sobre la lista vacía y mostrar los estados vacíos de los gráficos; no es un error HTTP. Las utilidades actuales calculan KPI en cero para una lista vacía. La API no garantiza que cada rango válido tenga coincidencias.
3. **Fecha inicial posterior a la final:** la API filtra aplicando ambos límites y no documenta una validación de orden. Si la respuesta es vacía, tratarla como resultado sin datos, no afirmar que la API rechaza el rango. Si se desea bloquearlo antes de consultar, esa sería una validación adicional de producto no definida en `/docs`.
4. **Error de petición o parámetro con formato inválido:** FastAPI valida las fechas; una fecha inválida puede producir HTTP 422. Si falla `fetch` o la respuesta no es exitosa, `App` muestra el aviso genérico «No se pudo cargar la informacion financiera. Revisa la API de backend.» y termina la carga. En una primera carga, las tarjetas reciben `metrics: null` y los gráficos reciben la lista inicial vacía; si falla una recarga, se conservan los últimos datos cargados. El mensaje detallado de validación de FastAPI no se presenta actualmente.

## Funcionalidad 2 — Alertas de anomalías de egresos

### Endpoint y respuesta

`GET /api/metrics/alerts` devuelve un array sin envoltorio (`MetricsAlert[]` según el modelo del backend). Cada objeto tiene `period: string`, `outcome_total: number`, `baseline_average: number` e `increase_ratio: number`. El tipo frontend existente es `AlertsResponse` / `AlertEntry` en [`./api-types.ts`](./api-types.ts). La ruta y el cálculo se encuentran en [`backend/app/routes.py`](../../backend/app/routes.py).

### Tipos TypeScript

| Uso | Tipo | Estado |
|---|---|---|
| Parámetros de fechas y threshold | `AlertsParams` | Existe en `./param-types.ts`; extiende `DateRangeFilter` y declara `threshold?: number`. Un comentario del tipo menciona `0.01`–`1.0` como rango de UI, pero no hay control de alertas implementado que lo aplique y ese rango **no** es una restricción API. Según `/docs`, el mínimo API es `0` y el default `0.3`. |
| Parámetro `group_by` | `'day' \| 'week' \| 'month'` | No aparece en `AlertsParams` actual. Es el enum del contrato OpenAPI; deberá añadirse al tipo de petición al integrar el endpoint. |
| Respuesta | `AlertsResponse` (`AlertEntry[]`) | Existe en `./api-types.ts`; respuesta de lista, posiblemente vacía. |
| `increase_ratio` | `number` | Es una razón relativa, no un porcentaje 0–100. Por ejemplo, `0.3` representa un aumento del 30%. El endpoint redondea a cuatro decimales. |

### Parámetros, valores y restricciones

| Parámetro | Tipo en API | Regla verificada |
|---|---|---|
| `threshold` | number | Opcional; mínimo `0`; default `0.3`. No se declara máximo. Es razón decimal, no porcentaje entero. |
| `group_by` | string enum | Opcional; `day`, `week` o `month`; default `month`. El campo `period` se expresa como `YYYY-MM-DD`, `YYYY-Www` o `YYYY-MM`, respectivamente. |
| `start_date`, `end_date` | date | Opcionales; formato de fecha ISO `YYYY-MM-DD`, límites inclusivos. |
| `business_type` | string enum | Opcional; `B2B` o `B2C`. Si se omite, no se aplica ese filtro de segmento. |

El backend compara cada egreso con el promedio de los períodos anteriores existentes en el resumen filtrado; no limita la línea base a tres períodos. Solo devuelve alertas cuando la línea base es mayor que cero y el aumento supera el umbral.

### Casos límite de UI

La interfaz de alertas no está implementada. Los siguientes son criterios de aceptación propuestos; las respuestas y validaciones indicadas sí derivan del contrato y la lógica de API.

1. **Respuesta `[]` (sin alertas):** conservar visible la sección y mostrar exactamente el estado vacío recomendado: **«No se detectaron anomalías para los filtros seleccionados.»** No renderizar filas. El contrato confirma que la respuesta puede ser un array vacío, pero no prescribe ese texto; es la recomendación de UI de esta guía.
2. **No existe línea base utilizable:** el backend omite alertas para el primer período y para períodos cuyo baseline sea cero. Si el resultado total es vacío, usar el mismo empty state del caso 1; no mostrar error.
3. **Threshold negativo o `group_by` inválido:** FastAPI rechaza los valores fuera de `threshold >= 0` o del enum `day | week | month` con HTTP 422. La UI futura debe mantener la sección y mostrar el estado de error **«No se pudieron cargar las alertas. Revisa los filtros e inténtalo de nuevo.»**, sin representar la respuesta como `[]`. El texto es una decisión de presentación propuesta, no un mensaje de API.
4. **`threshold = 0`:** es válido. El backend solo incluye períodos con `increase_ratio > threshold` y baseline positivo; por tanto, si el total de egresos del período es igual al baseline (`increase_ratio = 0`), no hay alerta. La UI debe presentar la lista devuelta sin añadir alertas por su cuenta.
5. **Agrupación `day` o `week`:** cada fila debe usar el `period` devuelto (`YYYY-MM-DD` o `YYYY-Www`); para `month`, el formato es `YYYY-MM`. No convertir el período a otro agrupamiento en cliente.

## Funcionalidad 3 — Capacidades analíticas adicionales de la API

Esta agrupación incluye facetas, resumen agregado, categorías principales, comparación y movimientos segmentados B2B/B2C. Estas rutas están documentadas en `/docs`, pero no se encontró consumo de ninguna desde `frontend/src` ni tipos TypeScript de respuesta para todos los modelos. En particular, `/api/metrics/facets` puede proveer opciones de filtros; no está conectada al formulario actual.

### Endpoints y tipos

| Endpoint | Petición/parámetros y valores | Respuesta API y tipo TS | Disponibilidad frontend |
|---|---|---|---|
| `GET /api/metrics/facets` | Sin parámetros. | Objeto `MetricsFacets`: `operation_types: OperationType[]`, `business_types: BusinessType[]`, `categories: Category[]`, `min_date: string`, `max_date: string`. TS existente: `FacetsResponse` en `./api-types.ts`. | No consumido actualmente. |
| `GET /api/metrics/summary` | `group_by` opcional (`day`, `week`, `month`; default `month`), fechas opcionales, `category` opcional, `operation_type` opcional y `business_type` opcional. Valores de enum en las tablas previas. | Array de `MetricsSummaryItem`: `{ period: string; income: number; outcome: number; net: number }`. No hay interfaz TS de respuesta específica en `frontend/specs` ni en `frontend/src/lib`. | No consumido; el frontend actual agrega movimientos localmente por mes. |
| `GET /api/metrics/categories/top` | `operation_type` opcional (default `outcome`; `income`/`outcome`); `limit` opcional, entero entre `1` y `20` inclusive (default `5`); fechas opcionales; `business_type` opcional (`B2B`/`B2C`). | Array de `TopCategoryItem`: `{ category: Category; operation_type: OperationType; total_amount: number }`. TS existentes: `TopCategoriesParams`, `TopCategoriesResponse` y `CategoryEntry`. | No consumido actualmente. |
| `GET /api/metrics/comparison` | `start_date` y `end_date` obligatorias, formato date `YYYY-MM-DD`; `business_type` opcional (`B2B`/`B2C`). | Objeto `MetricsComparison`: `{ current_period: number; previous_period: number; delta_abs: number; delta_pct: number \| null }`. No hay interfaz TS específica. | No consumido actualmente. |
| `GET /api/metrics/b2b` | Fechas, `category` y `operation_type` opcionales; valores y formatos como en la Funcionalidad 1. El segmento queda fijado por la ruta. | Array `FinancialMovement[]`. Tipo existente en `../src/lib/financial-types.ts`. | No consumido actualmente. |
| `GET /api/metrics/b2c` | Fechas, `category` y `operation_type` opcionales; valores y formatos como en la Funcionalidad 1. El segmento queda fijado por la ruta. | Array `FinancialMovement[]`. Tipo existente en `../src/lib/financial-types.ts`. | No consumido actualmente. |

Para integrar `/api/metrics/summary` o `/api/metrics/comparison`, crear tipos TypeScript de respuesta alineados con las formas de la tabla. La tabla describe la forma de los modelos de API; **no** declara que las interfaces TS faltantes ya existan.

### Restricciones adicionales

- `group_by` solo admite `day`, `week` o `month`; default `month` en summary.
- `limit` solo admite enteros de `1` a `20`; default `5`.
- `operation_type`, `category` y `business_type` aceptan únicamente los literales indicados en “Tipos compartidos y convenciones”.
- En summary y top categories, cada fecha es opcional e inclusiva. En comparison ambas fechas son obligatorias; no se declara en OpenAPI una restricción de orden entre ellas.
- Las respuestas de summary, top categories y las rutas B2B/B2C son arrays y pueden representarse como listas sin envolver; no hay paginación declarada.

### Casos límite de UI

Ninguna de estas vistas está implementada. Los criterios siguientes indican una presentación recomendada concreta, mientras que los datos/errores de API descritos se basan en el contrato. Aplicar el estado vacío correspondiente a la tarjeta o panel del endpoint que lo originó.

1. **Facetas:** la respuesta es un objeto que incluye las listas de opciones y `min_date`/`max_date`; con el dataset simulado actual, esas listas y fechas están pobladas. Si en el futuro se conecta un dataset vacío, el backend actual no devuelve facets vacías: `build_metrics_facets` intenta leer la primera/última fecha y falla. Antes de definir un empty state para ese escenario, cambiar el contrato o el backend para especificar cómo representar fechas inexistentes; la UI no debe asumir que hoy recibe arrays vacíos ni fechas omitidas.
2. **Resumen sin períodos (`GET /api/metrics/summary` devuelve `[]`):** conservar el panel de resumen y mostrar «No hay datos para los filtros seleccionados.»; no convertirlo en error ni fabricar períodos en cero. El endpoint responde con una lista de períodos.
3. **Top categories sin resultados:** conservar la tarjeta de categorías y mostrar «No hay categorías para los filtros seleccionados.»; no dibujar una serie vacía ni tratar `[]` como fallo.
4. **Comparación devuelve `delta_pct: null`:** mostrar `current_period`, `previous_period` y `delta_abs`; para el porcentaje mostrar «No disponible» y nunca calcular `0%` como sustituto. El backend retorna `null` cuando `previous_net == 0`.
5. **Movimientos B2B/B2C sin coincidencias:** conservar el panel del segmento consultado y mostrar «No hay movimientos para este segmento y filtros.»; no mezclar en él datos del otro segmento.
6. **Parámetro fuera de rango, enum/fecha inválidos o falta `start_date`/`end_date` en comparison:** tratar HTTP 422 como error, no como lista vacía. Mantener el panel y mostrar «No se pudieron cargar los datos. Revisa los filtros e inténtalo de nuevo.»; el mensaje es una recomendación de UI, no texto definido por FastAPI.
7. **Límite válido mínimo/máximo (`limit=1` o `limit=20`):** mostrar el número de categorías que efectivamente devuelva el endpoint (como máximo `limit`); no completar con categorías inventadas si devuelve menos. La API valida `1 <= limit <= 20` y ordena por total descendente.

## Rutas de verificación

- Documentación FastAPI usada para verificar los endpoints y contratos: [`http://localhost:8000/docs`](http://localhost:8000/docs).
- Esquema OpenAPI servido por la misma API: [`http://localhost:8000/openapi.json`](http://localhost:8000/openapi.json). Verificado con HTTP 200 durante esta revisión.
- Rutas, enums, modelos, defaults, límites y lógica efectiva: [`../../backend/app/routes.py`](../../backend/app/routes.py).
- Contratos de respuesta TypeScript existentes para movimientos, métricas derivadas y filtros: [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts), [`./api-types.ts`](./api-types.ts), [`./param-types.ts`](./param-types.ts).
- Consumo real, composición de UI y estados actuales: [`../src/App.tsx`](../src/App.tsx), [`../src/lib/financial-utils.ts`](../src/lib/financial-utils.ts), [`../src/components/dashboard/`](../src/components/dashboard/).
- Comprobación de integración analítica: búsqueda en `frontend/src/**` de `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`; no se encontraron llamadas.
