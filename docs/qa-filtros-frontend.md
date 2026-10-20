# Verificación de filtros y paginación

Fecha: 20 de octubre de 2026. Seguimiento: AB#24.

Se utilizó la API local con PostgreSQL y seis incidentes de prueba. Estos datos
representan escenarios de soporte; no corresponden a reportes de producción.

| Caso | Resultado observado |
| --- | --- |
| Estado Asignado, prioridad Alta, categoría Accesos y Técnico de Soporte | Un incidente que cumple los cuatro criterios. |
| Combinación sin coincidencias | Contador en cero, mensaje específico y opción de limpiar. |
| Limpiar los criterios | Se restauran los selectores y el listado general. |
| Seis incidentes con cinco por página | Primera página con cinco incidentes; segunda con uno; límites de navegación correctos. |
| Aplicar filtros desde la segunda página | Vuelve a la primera página y muestra el total filtrado. |
| Guardar un comentario después de filtrar | El comentario se guarda y aparece en el seguimiento. |
| API detenida | Aparece un error de conexión; no se muestran datos como actualizados. |
| Restablecer la API y pulsar Reintentar | Se recupera el listado filtrado. |
| Anchos de 390 y 1280 píxeles | Los filtros y el detalle se adaptan al espacio disponible. |

Durante la prueba de desconexión se detectó el mensaje técnico `Failed to fetch`.
Se sustituyó por un mensaje en español y se repitió la prueba de recuperación.

La compilación de ambos proyectos y las 32 pruebas automatizadas del backend
finalizaron correctamente. Las verificaciones de interfaz descritas aquí fueron
manuales; las pruebas automatizadas del frontend siguen registradas como DT-01.

La navegación implementada resuelve DT-03; su cierre queda sujeto a la revisión
y aprobación del Pull Request vinculado a AB#24.
