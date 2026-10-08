# Regla de backend

## Nombre
Backend financiero: preservar el contrato tipado y probar el comportamiento de las rutas.

## Objetivo
Mantener predecibles las respuestas y filtros de la API, y asegurar que sus cambios sigan siendo compatibles con el frontend.

## Alcance
`backend/app/**` y `backend/tests/**`, en particular `app/routes.py` y `tests/test_routes.py`.

## Justificación
FastAPI valida movimientos y parámetros mediante modelos Pydantic y tipos `Literal`. El frontend representa el mismo contrato en `financial-types.ts`. Además, las rutas usan datos simulados con semilla fija y las pruebas verifican filtros, orden y forma de respuesta; modificar esos comportamientos afecta el dashboard y su reproducibilidad.

## Guía específica del proyecto
- Define campos y parámetros con los modelos y tipos existentes (`FinancialMovement`, `OperationType`, `Category`, `BusinessType`); sincroniza todo cambio de contrato con los tipos TypeScript.
- Conserva la generación determinista usada por las rutas (`generate_mock_movements(seed=42)`) y considera que `random.seed` modifica el estado aleatorio global.
- Mantén los resultados filtrados en orden cronológico cuando corresponda.
- Al cambiar una ruta, añade o ajusta pruebas en `test_routes.py` para los parámetros y valores de respuesta afectados; verifica resultados, no solo el estado HTTP o la forma.
- Si cambian necesidades de acceso o se incorpora información sensible, restringe la configuración CORS abierta de `app/main.py` a los orígenes y permisos necesarios.

## Ejemplo correcto e incorrecto
Correcto, siguiendo `/api/metrics` en `app/routes.py` y sus pruebas:

```py
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    start_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
) -> list[FinancialMovement]:
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(movements, start_date, None, category, None)
    return ensure_chronological_order(filtered)
```

Incorrecto: aceptar `category: str` sin validar sus valores y cambiar la ruta sin probar que el filtro solo devuelve esa categoría. Se perderían las restricciones del contrato y la cobertura del comportamiento.
