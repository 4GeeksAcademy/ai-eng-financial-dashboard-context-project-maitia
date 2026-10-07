# Hallazgos y reglas de ingeniería

Reglas derivadas de la implementación y las pruebas actuales. Cada regla incluye su propósito y referencias para que contribuidores y agentes puedan verificar el contexto.

## Frontend

### Arquitectura

**Respetar la responsabilidad actual del frontend al modificar las métricas.** El dashboard consulta `/api/metrics` y calcula KPI y agregados mensuales mediante utilidades del cliente. Antes de añadir cálculos, identificar si la vista debe seguir usando esas utilidades o consumir una ruta analítica existente del backend, para evitar lógica duplicada o cambios en rutas que la vista no utiliza.

Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [backend/app/routes.py](backend/app/routes.py)

### Consistencia de datos

**La etiqueta del periodo debe corresponder a las fechas de los datos.** El periodo del encabezado está fijado a 2024, mientras que el backend genera movimientos usando el año actual y el anterior. Si cambia el periodo de los datos, actualizar también la etiqueta o hacer que esta se derive de los datos recibidos.

Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/components/dashboard/dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx), [backend/app/routes.py](backend/app/routes.py)

### Testing

**Acompañar cambios en cálculos del cliente con pruebas de las utilidades.** Las pruebas existentes cubren KPI, agregaciones mensuales y formato; extenderlas cuando cambien esos comportamientos.

Referencias: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), [frontend/package.json](frontend/package.json)

## Backend

### Arquitectura y consistencia de datos

**Mantener reproducible la generación de datos simulados.** Las rutas generan movimientos con una semilla fija y hay una prueba que comprueba el total y el orden cronológico. Si se modifica el generador, conservar resultados repetibles para las pruebas; evitar cambiar el estado aleatorio global cuando no sea necesario, ya que el generador llama a `random.seed`.

Referencias: [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py)

**Conservar los valores y estructuras del contrato del API al cambiar sus modelos.** Los modelos Pydantic definen tipos de movimiento, categorías y respuestas analíticas. Los cambios en campos o valores admitidos pueden afectar al frontend, por lo que deben revisarse también los tipos compartidos allí.

Referencias: [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts)

### Testing

**Añadir pruebas de comportamiento para rutas y filtros que se modifiquen.** La suite actual cubre rutas principales y algunas combinaciones, pero no todas las rutas ni combinaciones de parámetros. Cuando cambie una ruta, comprobar tanto los parámetros relevantes como el contenido de la respuesta.

Referencias: [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py)

**Verificar los resultados, no solo la forma, al modificar comparación o alertas.** Las pruebas actuales de esas rutas validan principalmente campos de respuesta o que la respuesta sea una lista. Añadir aserciones de resultados para los casos afectados por el cambio.

Referencias: [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py)

### Seguridad

**Revisar y restringir CORS si cambian los requisitos de acceso.** La configuración actual acepta cualquier origen, método y encabezado, y habilita credenciales. Antes de incorporar autenticación o datos sensibles, definir los orígenes y permisos concretos que requiere la aplicación.

Referencia: [backend/app/main.py](backend/app/main.py)

## Integración

### Arquitectura

**Usar el prefijo `/api` para el tráfico del frontend hacia el backend en desarrollo.** Vite reenvía ese prefijo al servicio `backend:8000`, y Docker Compose publica los puertos del frontend y del backend. Al modificar rutas o infraestructura local, mantener alineados esos tres puntos.

Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml)

**Mantener alineados los tipos TypeScript y los modelos Pydantic.** Las representaciones del movimiento financiero existen en ambos lados. Cualquier cambio de contrato debe actualizar los dos y añadir o ajustar pruebas para que el frontend y el API sigan interoperando.

Referencias: [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), [backend/tests/test_routes.py](backend/tests/test_routes.py)

### Documentación y DX

**Actualizar la documentación junto con cambios en el arranque o la configuración local.** Las instrucciones de ejecución describen Docker Compose y el proxy del frontend; si cambian los puertos, servicios o el flujo de inicio, actualizar la documentación para que coincida con la configuración efectiva.

Referencias: [README.es.md](README.es.md), [docker-compose.yml](docker-compose.yml), [frontend/vite.config.ts](frontend/vite.config.ts)

**Colocar las instrucciones para agentes en las ubicaciones que declara el proyecto.** La guía del repositorio indica `.agents/rules`, `.agents/skills` y `memory-bank` como ubicaciones relevantes; documentar allí las reglas y habilidades cuando se incorporen al proyecto.

Referencias: [AGENTS.md](AGENTS.md), [README.es.md](README.es.md)
