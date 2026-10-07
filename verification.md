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