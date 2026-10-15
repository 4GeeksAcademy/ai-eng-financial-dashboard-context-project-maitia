# Guía de checks del dashboard financiero

## Propósito y uso

Esta guía traduce `Checks-testing` a los comandos, contratos y riesgos de este repositorio. Úsala junto con `.agents/rules/frontend.md`, `.agents/rules/backend.md`, `memory-bank/product-context.md`, `memory-bank/tech-context.md` y `memory-bank/progress-context.md`. La selección de checks depende del alcance: no todos los cambios requieren todas las pruebas de integración.

## Mapa del proyecto

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS y Recharts. Código de la aplicación en `frontend/src/`; utilidades financieras en `frontend/src/lib/`; pruebas Vitest junto al código, incluyendo `frontend/src/lib/financial-utils.test.ts`.
- **Backend:** FastAPI y Pydantic. Rutas y lógica en `backend/app/routes.py`; pruebas pytest en `backend/tests/test_routes.py`.
- **Contrato compartido:** modelos Pydantic y tipos TypeScript se mantienen por separado. No hay comando de generación de tipos documentado; revisar ambos lados ante cambios de contrato.
- **Integración local:** Compose define `frontend` (Vite, puerto 5173) y `backend` (puerto 8000). Vite envía `/api` a `http://backend:8000`.
- **Aplicación actual:** consulta `GET /api/metrics`, calcula KPI y agregados mensuales en el cliente, y presenta estados de carga/error/sin datos en componentes relevantes. Las demás rutas de métricas pueden existir en la API sin estar conectadas a la UI actual; comprobar antes de describirlas como integradas.

## Comandos disponibles

Ejecuta desde la raíz del repositorio, salvo indicación distinta:

| Check | Comando | Qué aporta |
|---|---|---|
| Pruebas frontend | `cd frontend && npm test` | Ejecuta Vitest en modo CI (`vitest run`). |
| Build frontend | `cd frontend && npm run build` | Ejecuta `tsc -b` y `vite build`; comprueba tipos/build y genera assets. |
| Lint frontend | `cd frontend && npm run lint` | Ejecuta `eslint .`. Reporta todos los errores; no los suprimas para lograr un resultado verde. |
| Pruebas backend | `cd backend && python -m pytest` | Ejecuta la suite pytest del backend. |
| Configuración Compose | `docker compose config` | Valida la configuración resuelta de Docker Compose. |
| Arranque de integración | `docker compose up --build` | Construye e inicia frontend y backend; es interactivo/continuo, por lo que debe tratarse como un servicio que se deja ejecutando durante el smoke test y se detiene al terminar. |

No existe en `package.json` un script específico para pruebas de componentes, e2e, cobertura obligatoria o generación de tipos. No presentes esos checks como disponibles sin comprobar que se hayan añadido o configurado.

## Matriz de selección

| Tipo de cambio | Checks dirigidos | Checks adicionales según alcance |
|---|---|---|
| Fórmulas, agregación, formato monetario/porcentaje | Añadir/ajustar casos en `financial-utils.test.ts`; `cd frontend && npm test` | `npm run build` si cambian tipos o código de producción; backend pytest si también cambia la semántica del servidor. |
| Componente o estado del dashboard | Revisar carga, error, vacío y datos válidos del componente afectado; ejecutar `npm test` y `npm run build` | `npm run lint`; smoke test con Compose si depende de la API o cambia el montaje/renderizado relevante. No afirmar que hay pruebas de componente si no se han creado/configurado. |
| Endpoint, parámetro, modelo o lógica de ruta | Añadir/ajustar `backend/tests/test_routes.py`; `cd backend && python -m pytest` | Revisar Pydantic y tipos TS; ejecutar tests/build frontend si cambia el contrato o el consumo. Verificar OpenAPI si cambian parámetros o schema. |
| Cambios simultáneos de UI y API/contrato | Pruebas dirigidas frontend y backend; build frontend | Smoke test de Compose y ruta API/proxy, si los servicios están disponibles. |
| Proxy, Dockerfile, Compose, Nginx o configuración de arranque | `docker compose config`; build/arranque aplicable | Smoke test de HTML y `/api` desde el frontend en el modo afectado (desarrollo o producción). No sustituir esta comprobación por una llamada directa al backend. |
| Documentación sin cambios ejecutables | Revisar enlaces, comandos y afirmaciones contra archivos actuales | No declarar que tests/build/lint pasaron si no se ejecutaron. |

## Contratos y comportamiento financiero a proteger

### Frontend

- `frontend/src/lib/financial-utils.ts` concentra `computeKPIs`, `computeMonthlyData`, comparación de segmentos y formatos. Al modificar sus resultados, expresa el valor esperado con datos de prueba concretos.
- Comprueba, cuando el cambio aplique: lista vacía, ausencia de ingresos (porcentaje definido como cero en las utilidades actuales), meses cronológicos incluyendo cruce de año, sumas y redondeo/formato esperado.
- La representación de una cifra no debe cambiar silenciosamente la regla financiera. Si cambia una regla como el denominador de porcentaje, documenta la decisión y ajusta pruebas.
- `frontend/src/App.tsx` consulta datos y orquesta el estado de carga/error. Al cambiar su petición o su estado, diferencia respuesta exitosa vacía, error HTTP y fallo de red; no los colapses en un mismo estado sin requisito explícito.
- El encabezado del periodo tiene una discrepancia documentada con el rango que produce el backend. Si una modificación toca fechas o periodo visible, comprueba la correspondencia y no supongas que el texto fijo representa el rango real.

### Backend y API

- Las rutas y modelos están en `backend/app/routes.py`; las pruebas de ruta, en `backend/tests/test_routes.py`.
- Ante un cambio de parámetros o filtros, cubre valores válidos, combinación relevante, límites inclusivos cuando aplique y parámetros inválidos que FastAPI deba rechazar.
- Valida resultados y filtros —no solo `status_code`, no vacío o nombres de campos— para las rutas modificadas. Las pruebas actuales de algunas rutas analíticas tienen cobertura limitada; refuérzalas si el cambio las afecta.
- Conserva los enums/literales, la ordenación cronológica cuando corresponda y la generación determinista con `seed=42`, salvo que el requisito cambie explícitamente.
- Ante un cambio de respuesta, revisa modelo Pydantic, documentación OpenAPI, tipo TypeScript relacionado y consumidor frontend. No añadas tipos a una ruta como si ya estuvieran implementados sin comprobarlo.

### Estados visuales

Para una UI que consume datos, prueba o verifica el comportamiento pertinente de:

1. carga inicial;
2. éxito con resultados;
3. éxito con lista vacía o cero movimientos;
4. respuesta HTTP no exitosa;
5. fallo de red;
6. recarga fallida con datos previos, si esa ruta de estado existe.

Conserva la diferencia entre `[]` como resultado válido y un error de transporte/validación. Los textos y estados de funcionalidades futuras deben tratarse como requisitos de producto solo si se han acordado.

## Smoke test de integración

Cuando el cambio afecte a comunicación entre servicios, arranque o despliegue:

1. Valida la configuración con `docker compose config`.
2. Inicia el modo correspondiente con `docker compose up --build` (producción opcional usa el perfil configurado en Compose; inspecciona el archivo actual antes de dar por hecho un puerto o servicio).
3. Comprueba que el frontend devuelve HTML y que el cliente puede obtener la ruta `/api/metrics` mediante su proxy, no solo desde el backend directamente.
4. Comprueba status HTTP y una propiedad significativa de la respuesta —por ejemplo, array JSON de movimientos con los campos esperados— en vez de limitarse a que el socket responda.
5. Detén los servicios al concluir y registra cualquier timeout, error de contenedor o dependencia no disponible.

La verificación del proxy en desarrollo no demuestra automáticamente el proxy de producción ni viceversa. Registra cuál configuración se probó.

## Fallos conocidos y evidencia

El contexto de progreso contiene incidencias históricas de dependencias/permisos, lint y conectividad del proxy. Antes de reutilizarlas como estado actual, verifica el contenido vigente y, si es posible, vuelve a ejecutar el check. Describe cada resultado como uno de estos estados:

- **APROBADO:** comando ejecutado y terminado correctamente.
- **FALLIDO:** comando ejecutado y devolvió errores o código distinto de cero.
- **NO EJECUTADO:** no se intentó; indicar motivo.
- **BLOQUEADO:** se intentó o era necesario, pero una limitación externa impidió obtener un resultado válido; indicar evidencia.

Una API accesible desde el host no prueba que Vite o Nginx pueda alcanzarla dentro de Compose. Un build exitoso histórico tampoco valida cambios posteriores. No uses un fallo previo como excusa para omitir una nueva ejecución cuando el entorno ya pueda haber cambiado.

## Formato sugerido de informe

```text
Alcance: [archivos y comportamiento]

Checks:
- [APROBADO | FALLIDO | NO EJECUTADO | BLOQUEADO] `comando` — [resultado breve]
- ...

Regresión cubierta: [casos añadidos o revisados]
Riesgos/pendientes: [checks omitidos, limitaciones y motivo]
Conclusión: [verificado | parcialmente verificado | no verificado]
```

La conclusión `verificado` requiere que los checks pertinentes al riesgo del cambio hayan pasado. Si un check esencial no se pudo ejecutar, usa `parcialmente verificado` o `no verificado` y déjalo como pendiente explícito.
