# Indicadores de incidentes

`GET /api/incidents/metrics` devuelve los indicadores generales del sistema en
`data`. Se calculan sobre PostgreSQL, independientemente de los filtros o la
página que se esté consultando en la bandeja.

| Campo | Definición |
| --- | --- |
| `total` | Todos los incidentes registrados. |
| `open` | Incidentes en NUEVO, ASIGNADO o EN_PROCESO. |
| `resolved` | Incidentes en RESUELTO, pendientes de cierre. |
| `closed` | Incidentes en CERRADO. |
| `critical` | Incidentes de prioridad CRITICAL que siguen abiertos. |
| `byStatus` | Conteo de los cinco estados; incluye estados con cero incidentes. |
| `byCategory` | Distribución de todos los incidentes por categoría. |
| `byTechnician` | Distribución de todos los incidentes por técnico, incluyendo Sin asignar. |
| `generatedAt` | Fecha y hora UTC de generación de la respuesta. |

Se cumple `total = open + resolved + closed`. Los críticos son un subconjunto
de los abiertos y no deben sumarse al total. Las distribuciones incluyen tanto
incidentes abiertos como terminados y sus conteos suman el total registrado.
La distribución por técnico no representa exclusivamente la carga pendiente.

Los conteos se obtienen mediante agregaciones de PostgreSQL, sin descargar la
lista completa de incidentes. Las consultas comparten una transacción de
lectura Repeatable Read para calcular los indicadores sobre la misma vista de
los datos, incluso cuando otro usuario actualiza un incidente durante la consulta.
Las categorías y técnicos inactivos se conservan en la distribución histórica
si todavía tienen incidentes asociados.

Una base sin incidentes devuelve HTTP 200, indicadores en cero, los cinco estados
en cero y distribuciones vacías. Los errores de base de datos devuelven el error
general de la API sin exponer consultas ni credenciales.
