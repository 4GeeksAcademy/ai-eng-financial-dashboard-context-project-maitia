# Verificación de afirmaciones

1. **Afirmación inicial:** El backend genera 360 movimientos simulados: 12 meses con 30 por mes.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Correcta.
   **Razonamiento:** El generador recorre 12 meses y agrega 30 movimientos por mes; una prueba verifica el total de 360.
   **Corrección:** Ninguna.

2. **Afirmación inicial:** El frontend solicita `/api/metrics` y calcula KPI y datos mensuales de la respuesta.
   **Archivos revisados:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
   **Estado actual:** Correcta.
   **Razonamiento:** La respuesta de la petición se procesa con `computeKPIs` y `computeMonthlyData`.
   **Corrección:** Ninguna.

3. **Afirmación inicial:** Vite reenvía `/api` a `http://backend:8000`; Docker Compose publica frontend en 5173 y backend en 8000.
   **Archivos revisados:** [frontend/vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml).
   **Estado actual:** Correcta.
   **Razonamiento:** El proxy y ambos mapeos de puertos están definidos en esos archivos.
   **Corrección:** Ninguna.

4. **Afirmación inicial:** FastAPI expone `/health` y rutas bajo `/api/metrics`, y hay pruebas para esas rutas.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Parcialmente correcta.
   **Razonamiento:** Las rutas existen y hay pruebas de salud y de varias rutas de métricas, pero no se cubren exhaustivamente todas las rutas y combinaciones de parámetros.
   **Corrección:** Las pruebas cubren rutas principales, no todas las rutas o combinaciones.

## Funcionalidad 1 — Filtro de rango de fechas en el dashboard principal

1. **Afirmación inicial:** La API ya filtra movimientos por fechas, pero el dashboard aún no ofrece ni aplica filtros.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [frontend/src/App.tsx](frontend/src/App.tsx).
   **Estado actual:** Correcta.
   **Razonamiento:** `GET /api/metrics` admite `start_date` y `end_date` opcionales; el frontend solicita la ruta sin parámetros y no tiene controles de fecha.
   **Corrección:** Ninguna.

2. **Afirmación inicial:** `/api/metrics/facets` proporciona las fechas para orientar el rango.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Correcta, con distinción de campos.
   **Razonamiento:** La respuesta incluye `min_date` y `max_date`; son límites de referencia y no parámetros de filtro. La ruta no recibe parámetros.
   **Corrección:** Los filtros de `/api/metrics` se llaman `start_date` y `end_date`; las fechas de facetas se llaman `min_date` y `max_date`.

3. **Afirmación inicial:** El frontend ya tiene un patrón o extensión de filtros y construcción de parámetros que se pueda reutilizar.
   **Archivos revisados:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [frontend/vite.config.ts](frontend/vite.config.ts).
   **Estado actual:** Incorrecta.
   **Razonamiento:** La única llamada frontend es `fetch` GET a `/api/metrics`, sin parámetros; no se encontró `URLSearchParams`, consulta de facetas ni tipo de respuesta para ellas. Vite reenvía `/api` al backend.
   **Corrección:** La petición debe alinearse con el contrato existente: GET, parámetros de consulta `start_date` y/o `end_date` en `YYYY-MM-DD`; omitir los parámetros vacíos, pues la API espera fechas válidas o `None`.

## Funcionalidad 2 — Tabla de alertas de anomalías en el dashboard principal

1. **Afirmación inicial:** La API ofrece alertas y admite umbral configurable y fechas.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Correcta.
   **Razonamiento:** `GET /api/metrics/alerts` acepta `threshold` (predeterminado `0.3`, mínimo `0`), `start_date` y `end_date` opcionales, y devuelve una lista. La prueba actual envía el umbral como parámetro de consulta.
   **Corrección:** Ninguna.

2. **Afirmación inicial:** La API entrega la media móvil de los tres periodos anteriores requerida por la tabla.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), modelo `MetricsAlert` y función `detect_outcome_alerts()`.
   **Estado actual:** Incorrecta.
   **Razonamiento:** La API devuelve `baseline_average`, pero el cálculo promedia todos los periodos anteriores disponibles, no solo los tres previos. Los campos reales son `period`, `outcome_total`, `baseline_average` e `increase_ratio`; este último es una proporción decimal.
   **Corrección:** La media móvil solicitada no está implementada; no confundir `outcome_total` con el nombre descriptivo “Outcome registrado” ni `increase_ratio` con un porcentaje ya formateado.

3. **Afirmación inicial:** El dashboard muestra la tabla, el input de umbral y un estado vacío cuando no hay alertas.
   **Archivos revisados:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Incorrecta.
   **Razonamiento:** El frontend solo consulta `/api/metrics`; no consume alertas ni declara sus tipos o controles. La prueba de alertas comprueba la lista y los nombres de campos, pero no valida los valores calculados ni la media de tres periodos.
   **Corrección:** La interfaz y pruebas de resultados para el cálculo requerido no están implementadas. Si se envían fechas, la ruta filtra antes de resumir; por tanto, la referencia no incluye periodos anteriores al inicio del rango.

## Funcionalidad 3 — Vista comparativa B2B vs B2C

1. **Afirmación inicial:** La API permite consultar las cinco categorías principales de ingresos por línea de negocio.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Parcialmente correcta.
   **Razonamiento:** `GET /api/metrics/categories/top` admite `operation_type=income`, `limit=5`, fechas y `business_type=B2B|B2C`; devuelve `category`, `operation_type` y `total_amount`. Pero los ingresos generados solo usan `sales` y `others`, así que no habrá cinco categorías distintas.
   **Corrección:** `limit=5` significa hasta cinco resultados; la respuesta no incluye porcentaje sobre el total del grupo.

2. **Afirmación inicial:** `/api/metrics/facets` entrega categorías disponibles filtradas para cada grupo y tipo de operación.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
   **Estado actual:** Incorrecta.
   **Razonamiento:** `GET /api/metrics/facets` devuelve `categories` y `business_types` globales; no acepta filtros ni deriva categorías por grupo o tipo de operación.
   **Corrección:** Las facetas identifican categorías y grupos disponibles, pero no son listas segmentadas.

3. **Afirmación inicial:** La API ya provee un único conjunto de datos para el gráfico comparativo B2B frente a B2C.
   **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py), [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).
   **Estado actual:** Incorrecta.
   **Razonamiento:** `GET /api/metrics/summary` admite `business_type`, `operation_type` y fechas, y devuelve `period`, `income`, `outcome` y `net`; se filtra por un grupo por llamada. El frontend no consume esa ruta ni declara sus tipos.
   **Corrección:** No existe actualmente una vista comparativa con tablas, porcentajes, filtro de fechas y gráfico conjunto; `total_amount` tampoco incluye un total de grupo para calcular los porcentajes directamente.