# Verificación del dashboard

Seguimiento: AB#26. Fecha: 20 de octubre de 2026.

## Datos y comprobaciones

Se utilizaron los seis incidentes de prueba de PostgreSQL. El dashboard mostró
total 6, abiertos 6, cerrados 0 y críticos pendientes 1, de acuerdo con la API.
La distribución por estado mostró cinco nuevos y uno asignado; las categorías
y los responsables mostraron conteos y porcentajes correspondientes al total.

| Caso verificado en navegador | Resultado |
| --- | --- |
| Carga inicial | Tarjetas y gráficas con datos de la API; fecha de actualización visible. |
| Actualización con API detenida | Advertencia y conservación de los últimos datos disponibles. |
| Carga inicial con API detenida | Mensaje de error y reintento; no aparecen conteos ficticios. |
| Recuperación del servicio | Reintentar carga nuevamente las métricas. |
| Escritorio, 1440 píxeles | Cuatro tarjetas, gráficas en dos columnas y tabla por responsable. |
| Móvil, 390 píxeles | Tarjetas en dos columnas y gráficas apiladas sin desbordamiento horizontal. |

Las divisiones por total usan una comprobación de cero para evitar porcentajes
inválidos. Las leyendas permiten leer los estados con conteo cero. Las barras
usan el total de incidentes como denominador y no una escala ficticia.

Se revisó el contraste de los textos secundarios y se oscurecieron etiquetas
pequeñas para mejorar su legibilidad. Las gráficas tienen etiquetas textuales,
valores accesibles y una paleta consistente. No se declara una certificación
de accesibilidad completa.

La compilación del frontend finalizó correctamente. El backend conserva su
suite de 36 pruebas. Estas verificaciones de interfaz fueron manuales; DT-01
sigue pendiente hasta incorporar pruebas automatizadas del frontend.
