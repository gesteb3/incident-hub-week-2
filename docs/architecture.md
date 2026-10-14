# Arquitectura inicial

IT Incident Hub utiliza una arquitectura web de tres capas:

1. React y TypeScript para la interfaz.
2. Node.js, Express y TypeScript para la API REST.
3. PostgreSQL para persistencia relacional y trazabilidad.

## Modelo de datos

- `users`: solicitantes, técnicos y administradores.
- `categories`: catálogo administrable de categorías.
- `incidents`: información principal, prioridad, estado y asignación.
- `incident_comments`: seguimiento escrito por incidente.
- `incident_history`: bitácora auditable de eventos y cambios de estado.

Los identificadores son UUID. Las fechas se almacenan como `TIMESTAMPTZ` y los filtros obligatorios cuentan con índices específicos.
