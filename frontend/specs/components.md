# Especificación de componentes por funcionalidad

Este documento distingue entre componentes que existen en el frontend y capacidades que solo están disponibles en la API. No implica que las rutas analíticas sin integración tengan una interfaz implementada.

## Fuentes verificadas

- Documentación interactiva de FastAPI: [`http://localhost:8000/docs`](http://localhost:8000/docs).
- Esquema OpenAPI servido por la API: [`http://localhost:8000/openapi.json`](http://localhost:8000/openapi.json). Se consultó este esquema para verificar rutas, parámetros y modelos de respuesta.
- Código de rutas/modelos y lógica del API: [`../../backend/app/routes.py`](../../backend/app/routes.py).
- Composición de la pantalla: [`../src/App.tsx`](../src/App.tsx).
- Componentes y utilidades frontend citados en cada funcionalidad.

La URL de `/docs` requiere que el backend esté ejecutándose en `localhost:8000`. El enlace al esquema es la fuente legible por máquina de los contratos expuestos en esa documentación.

---

## Funcionalidad 1 — Resumen financiero y filtros de fecha

### Componente: `App`

**Archivo:** [`../src/App.tsx`](../src/App.tsx)

**Props:** No recibe props.

**Layout:** Contenedor principal de la página con encabezado, formulario de rango de fechas, aviso de error, sección de KPI y una grilla de dos gráficos.

**Comportamiento:**

- Al montar y al aplicar otro rango, solicita `GET /api/metrics`.
- Envía `start_date` y `end_date` solo cuando cada input tiene valor. Con ambos vacíos, solicita la ruta sin query string; con uno lleno, manda solo ese límite.
- El contrato API define ambas fechas como opcionales y con formato de fecha ISO (`YYYY-MM-DD`). En la lógica del backend los límites son inclusivos. El backend no exige que ambos estén presentes.
- Durante la consulta activa `loading`, limpia el error y evita que una respuesta obsoleta reemplace el resultado de una consulta más reciente.
- Si la solicitud falla, muestra un aviso de error. Los KPI y gráficos siguen recibiendo sus props de carga.
- Convierte los movimientos de la respuesta mediante `computeKPIs` y `computeMonthlyData`; no duplica esos cálculos en los componentes visuales.

**Renderizado condicional:**

- El aviso de error se monta únicamente cuando `error` tiene contenido.
- KPI y gráficos reciben `loading`; sus propios componentes muestran esqueletos mientras está activo.
- El formulario y las secciones se mantienen montados durante carga y error.

**Integración API:**

- `GET /api/metrics` devuelve una lista de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`.
- Los parámetros documentados son `start_date`, `end_date`, `category` y `operation_type`. En la implementación actual del formulario solo se envían las dos fechas.

### Componente: formulario de rango de fechas (markup dentro de `App`)

**Archivo:** [`../src/App.tsx`](../src/App.tsx)

**Props:** No es un componente independiente y no recibe props. Mantiene los valores de los inputs en el estado de `App`.

**Layout:** Dos campos `input type="date"`, etiquetados “Fecha inicial” y “Fecha final”, un botón de envío “Aplicar fechas” y una indicación de que dejar ambas fechas vacías muestra todos los datos.

**Comportamiento:**

- El envío aplica el rango capturado por ambos campos.
- Si solo la fecha inicial está llena, se envía `start_date` y no `end_date`; si solo la fecha final está llena, se envía `end_date` y no `start_date`.
- Si ambas están vacías, no se envían parámetros de fecha.
- No se encontró validación frontend que impida un rango donde la fecha inicial sea posterior a la final. La relación de las dos fechas no se documenta como una restricción en OpenAPI.

**Renderizado condicional:** Ninguno; ambos inputs, el botón y la ayuda están siempre visibles.

**Integración:** El submit handler actualiza el rango aplicado de `App`, que dispara la consulta del endpoint de movimientos.

### Componente: `DashboardHeader`

**Archivo:** [`../src/components/dashboard/dashboard-header.tsx`](../src/components/dashboard/dashboard-header.tsx)

**Props:** `period?: string` — etiqueta del período mostrada en el encabezado. Valor por defecto en el componente: `2024 — Full Year`.

**Layout:** Título y subtítulo a la izquierda con icono, etiqueta de período a la derecha; apila los bloques en pantallas pequeñas.

**Comportamiento:** Solo presenta el texto recibido; no obtiene fechas ni calcula un período.

**Renderizado condicional:** El valor de período recibido reemplaza al predeterminado; no hay otra condición de presentación.

**Integración:** `App` lo llama actualmente con `period="2024 - Full Year"`. No se actualiza en función del filtro aplicado, por lo que no debe interpretarse como una representación dinámica del rango consultado.

### Componente: `KPIRow`

**Archivo:** [`../src/components/dashboard/kpi-row.tsx`](../src/components/dashboard/kpi-row.tsx)

**Props:**

- `metrics: KPIMetrics | null` — totales ya calculados de ingresos, egresos, beneficio y margen.
- `loading?: boolean` — indica que los datos están cargando.

**Layout:** Grilla adaptable de cuatro tarjetas: Total Income, Total Outcome, Profit y Profit Margin.

**Comportamiento:** Formatea valores con `formatCurrency` o `formatPercent` y compone un `KPICard` por indicador. Si `metrics` es `null`, pasa `—` como valor a las tarjetas.

**Renderizado condicional:** No cambia el número de tarjetas. Pasa `loading` a cada `KPICard`, que sustituye el contenido por esqueletos.

**Integración:** Recibe de `App` el resultado de `computeKPIs(movements)`. `KPIMetrics` está definido en [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts).

### Componente: `KPICard`

**Archivo:** [`../src/components/dashboard/kpi-card.tsx`](../src/components/dashboard/kpi-card.tsx)

**Props:**

- `label: string` — nombre del indicador.
- `value: string` — valor listo para presentar.
- `helperText: string` — descripción secundaria.
- `icon: LucideIcon` — icono del indicador.
- `variant: 'income' | 'outcome' | 'profit' | 'profitPercent'` — estilo de color.
- `loading?: boolean` — estado de carga opcional.

**Layout:** Tarjeta con etiqueta e icono, valor principal y texto auxiliar.

**Comportamiento:** Selecciona colores según `variant`; no hace cálculos ni obtiene datos.

**Renderizado condicional:** Con `loading` muestra esqueletos en lugar de la tarjeta con valores; de lo contrario presenta sus props.

**Integración:** Utilizado cuatro veces por `KPIRow`.

### Componente: `IncomeOutcomeChart`

**Archivo:** [`../src/components/dashboard/income-outcome-chart.tsx`](../src/components/dashboard/income-outcome-chart.tsx)

**Props:**

- `data: MonthlyDataPoint[]` — puntos mensuales con `month`, `income`, `outcome` y `profitPercent`.
- `loading?: boolean` — estado de carga opcional.

**Layout:** Tarjeta con título y descripción; en estado con datos contiene un gráfico de líneas con ingresos y egresos por mes, ejes, leyenda y tooltip.

**Comportamiento:** El tooltip formatea importes como moneda. La serie utiliza los datos mensuales entregados; no consulta la API directamente.

**Renderizado condicional:**

- Si `loading` es verdadero, muestra esqueletos.
- Si no está cargando y ningún punto tiene ingresos o egresos mayores que cero, muestra “No data available to display”.
- En caso contrario, muestra el gráfico.

**Integración:** `App` le pasa `monthlyData` calculado por `computeMonthlyData`.

### Componente: `ProfitPercentChart`

**Archivo:** [`../src/components/dashboard/profit-percent-chart.tsx`](../src/components/dashboard/profit-percent-chart.tsx)

**Props:**

- `data: MonthlyDataPoint[]` — puntos mensuales, incluido `profitPercent`.
- `loading?: boolean` — estado de carga opcional.

**Layout:** Tarjeta con título y descripción; gráfico de línea mensual del margen, eje porcentual, línea de referencia en cero y tooltip.

**Comportamiento:** Presenta el margen de beneficio del conjunto de datos recibido; no consulta la API directamente.

**Renderizado condicional:**

- Si `loading` es verdadero, muestra esqueletos.
- Si no está cargando y todos los puntos tienen `profitPercent === 0` (incluida una lista vacía), muestra “No data available to display”.
- En caso contrario, muestra el gráfico.

**Integración:** `App` le pasa los mismos datos mensuales calculados para el gráfico de ingresos/egresos.

---

## Funcionalidad 2 — Alertas de anomalías de egresos (API disponible, interfaz no implementada)

### Componente de tabla de alertas

**Estado comprobado:** No se encontró un componente frontend de alertas ni consumo de `/api/metrics/alerts` en `App`. Por ello, actualmente no hay props, layout ni renderizado condicional implementados para una tabla; no se describen como funcionalidad existente.

**Contrato API verificado en `/docs`:** `GET /api/metrics/alerts` devuelve un array (posiblemente vacío) de elementos con `period`, `outcome_total`, `baseline_average` e `increase_ratio`. Parámetros:

- `threshold`: número opcional, predeterminado `0.3`, mínimo `0`.
- `group_by`: `day`, `week` o `month`, predeterminado `month`.
- `start_date` y `end_date`: fechas opcionales.
- `business_type`: `B2B` o `B2C`, opcional.

`increase_ratio` es una razón relativa, no un porcentaje en escala 0–100. La función del backend compara el egreso del período con el promedio de los períodos anteriores incluidos en el resumen y devuelve un elemento cuando la razón supera el umbral; no es necesariamente un promedio de solo los tres períodos previos.

**Estado vacío:** El requisito expresado para la interfaz es que, cuando no haya alertas para el umbral vigente, la tabla permanezca visible y presente un mensaje explícito de estado vacío en vez de desaparecer. Ese comportamiento no está implementado ni validado en el frontend actual. El contrato API confirma que la respuesta es una lista, pero no define texto ni formato visual para el mensaje.

**Renderizado condicional comprobado:** No existe renderizado de la tabla en el dashboard. Las condiciones para tabla con resultados, lista vacía, carga y error deberán definirse al implementar esa funcionalidad; no se inventan aquí props o componentes inexistentes.

---

## Funcionalidad 3 — Otras capacidades analíticas de la API (sin componentes frontend identificados)

Las rutas siguientes están expuestas por la API y aparecen en `/docs`, pero no se encontró integración en la pantalla actual. No se especifican componentes de UI que no existen en el código revisado.

| Capacidad API | Endpoint y contrato comprobado en `/docs` | Estado de interfaz |
|---|---|---|
| Facetas | `GET /api/metrics/facets`; respuesta con `operation_types`, `business_types`, `categories`, `min_date` y `max_date`; no recibe parámetros. | No se encontró consumo en `App`. |
| Resumen agregado | `GET /api/metrics/summary`; `group_by` (`day`, `week`, `month`, predeterminado `month`), fechas opcionales, `category`, `operation_type` y `business_type` opcionales; devuelve `period`, `income`, `outcome` y `net`. | No se encontró consumo en `App`; el agregado mensual actual se calcula en el cliente desde movimientos. |
| Categorías principales | `GET /api/metrics/categories/top`; `operation_type` predeterminado `outcome`, `limit` de 1 a 20 predeterminado 5, fechas y `business_type` opcionales; cada elemento contiene `category`, `operation_type` y `total_amount`. | No se encontró consumo en `App`. |
| Comparación entre períodos | `GET /api/metrics/comparison`; `start_date` y `end_date` son obligatorios, `business_type` opcional; respuesta `current_period`, `previous_period`, `delta_abs` y `delta_pct` (nullable). | No se encontró consumo en `App`. |
| Movimientos segmentados | `GET /api/metrics/b2b` y `GET /api/metrics/b2c`; fechas, categoría y tipo de operación opcionales; devuelven movimientos. | No se encontró consumo en `App`. |

---

## Rutas utilizadas para verificar hallazgos

- Documentación FastAPI solicitada: `http://localhost:8000/docs`.
- Esquema que se consultó para contrastar métodos, parámetros, valores permitidos y formas de respuesta: `http://localhost:8000/openapi.json`.
- Definiciones de ruta y lógica de filtros/alertas: [`../../backend/app/routes.py`](../../backend/app/routes.py).
- Composición, formulario de fechas, solicitud y estados de pantalla: [`../src/App.tsx`](../src/App.tsx).
- Componentes de presentación: [`../src/components/dashboard/dashboard-header.tsx`](../src/components/dashboard/dashboard-header.tsx), [`../src/components/dashboard/kpi-row.tsx`](../src/components/dashboard/kpi-row.tsx), [`../src/components/dashboard/kpi-card.tsx`](../src/components/dashboard/kpi-card.tsx), [`../src/components/dashboard/income-outcome-chart.tsx`](../src/components/dashboard/income-outcome-chart.tsx), [`../src/components/dashboard/profit-percent-chart.tsx`](../src/components/dashboard/profit-percent-chart.tsx).
- Tipos y cálculos del frontend: [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts), [`../src/lib/financial-utils.ts`](../src/lib/financial-utils.ts).
