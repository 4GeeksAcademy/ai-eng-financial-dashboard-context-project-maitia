# Contexto técnico

## Lenguajes

- **Frontend:** TypeScript y JSX en la aplicación React. Referencias: [App.tsx](../frontend/src/App.tsx), [tsconfig.app.json](../frontend/tsconfig.app.json).
- **Backend:** Python. La imagen usa Python 3.13. Referencias: [routes.py](../backend/app/routes.py), [main.py](../backend/app/main.py), [backend/Dockerfile](../backend/Dockerfile).
- **Configuración de frontend:** JSON, por ejemplo el manifiesto npm y la configuración de TypeScript. Referencias: [package.json](../frontend/package.json), [tsconfig.json](../frontend/tsconfig.json).

## Frameworks y herramientas

- **Frontend:** React 19, Vite 8, Tailwind CSS 4 y Recharts 3; Vitest para pruebas, TypeScript para tipos y compilación. Referencias: [package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts).
- **Backend:** FastAPI, Pydantic para los modelos de respuesta y Uvicorn para servir la aplicación. Referencias: [requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py), [backend/Dockerfile](../backend/Dockerfile).
- **Contenedores:** Docker Compose define los servicios `frontend` y `backend`; publica los puertos 5173 y 8000. Referencia: [docker-compose.yml](../docker-compose.yml).

## Comunicación entre frontend y backend

- `App.tsx` solicita `GET /api/metrics`; el prefijo `/api` se reenvía en desarrollo a `http://backend:8000` mediante el proxy de Vite. Referencias: [App.tsx](../frontend/src/App.tsx), [vite.config.ts](../frontend/vite.config.ts).
- Docker Compose proporciona el nombre de servicio `backend` y publica ambos servicios en los puertos indicados. Referencia: [docker-compose.yml](../docker-compose.yml).
- FastAPI registra el router que define las rutas y modelos de respuesta. Referencias: [main.py](../backend/app/main.py), [routes.py](../backend/app/routes.py).
- La interfaz calcula KPI y agregados mensuales en el cliente; los tipos TypeScript del movimiento financiero se mantienen manualmente y corresponden al modelo Pydantic. Referencias: [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [financial-types.ts](../frontend/src/lib/financial-types.ts), [routes.py](../backend/app/routes.py).
- `VITE_API_BASE_URL` permite anteponer una base alternativa a la ruta del API. Referencia: [App.tsx](../frontend/src/App.tsx).
- Rutas definidas: `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`. Referencia: [routes.py](../backend/app/routes.py).

## Estructura del proyecto

```text
backend/
	app/       API, modelos y lógica de métricas
	tests/     pruebas pytest
frontend/
	src/
		components/  componentes del dashboard e interfaz
		lib/         tipos y utilidades financieras
memory-bank/     contexto del proyecto
```

Referencias: [routes.py](../backend/app/routes.py), [test_routes.py](../backend/tests/test_routes.py), [App.tsx](../frontend/src/App.tsx), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [product-context.md](product-context.md).

## Comandos

Ejecutar la aplicación completa en contenedores desde la raíz:

```bash
docker compose up --build
```

Referencias: [README.es.md](../README.es.md), [docker-compose.yml](../docker-compose.yml).

Comandos disponibles para el frontend:

```bash
cd frontend && npm test
cd frontend && npm run build
cd frontend && npm run lint
```

Referencias: [package.json](../frontend/package.json), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts).

Pruebas del backend:

```bash
cd backend && python -m pytest
```

Referencias: [requirements.txt](../backend/requirements.txt), [test_routes.py](../backend/tests/test_routes.py).