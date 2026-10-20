# Consulta de incidentes

`GET /api/incidents` permite combinar filtros por estado, prioridad, categoría y
técnico. Se devuelven solamente los incidentes que cumplen todos los filtros
enviados. Omitir un filtro equivale a consultar todos sus valores.

| Parámetro | Valores | Obligatorio |
| --- | --- | --- |
| `status` | NUEVO, ASIGNADO, EN_PROCESO, RESUELTO, CERRADO | No |
| `priority` | LOW, MEDIUM, HIGH, CRITICAL | No |
| `categoryId` | UUID de categoría | No |
| `technicianId` | UUID de técnico | No |
| `page` | Entero positivo; predeterminado 1 | No |
| `limit` | Entero entre 1 y 100; predeterminado 20 | No |

Ejemplo:

```http
GET /api/incidents?status=NUEVO&priority=HIGH&page=1&limit=10
```

La respuesta conserva `data` y `meta` (`page`, `limit`, `total`, `totalPages`).
El total cuenta solamente incidentes que cumplen los filtros. Sin coincidencias
se devuelve HTTP 200, `data: []`, `total: 0` y `totalPages: 0`.

Los resultados se ordenan por fecha descendente y, ante fechas iguales, por ID
descendente para mantener un orden estable entre páginas.

Valores vacíos, repetidos, desconocidos o con formato incorrecto producen HTTP
400 con código `VALIDATION_ERROR`; los nombres de parámetros desconocidos
también se rechazan para evitar que un filtro mal escrito se ignore.

## Verificación

Las pruebas HTTP verifican cada filtro individual, la combinación de los cuatro,
el conteo filtrado, la paginación y el rechazo de valores inválidos antes de
consultar la base de datos. Las consultas se realizan mediante Prisma, sin
concatenar SQL con entradas del usuario.
