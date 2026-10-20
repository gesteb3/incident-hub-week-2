# Registro de deuda tecnica

Fecha de identificacion: 20 de octubre de 2026.

| ID | Deuda comprobada | Riesgo | Prioridad | Estado | Tratamiento previsto |
| --- | --- | --- | --- | --- | --- |
| DT-01 | El frontend no tiene pruebas automatizadas. | Una regresion visual o de integracion puede llegar a `main`. | Alta | Pendiente | Agregar pruebas de componentes y del flujo principal. |
| DT-02 | La API no aplica autenticacion ni autorizacion por rol. | Un despliegue publico permitiria operaciones sin verificar identidad. | Alta | Pendiente | Incorporar autenticacion y permisos de solicitante, tecnico y administrador. |
| DT-03 | Los listados no tienen paginacion. | El tiempo de respuesta crecera con el volumen de incidentes. | Media | Pendiente | Agregar limites, cursor o pagina y metadatos de respuesta. |
| DT-04 | No se publican metricas de cobertura de pruebas. | No existe una medida objetiva de codigo ejercitado por las pruebas. | Media | Pendiente | Generar cobertura y publicarla como resultado del pipeline. |
| DT-05 | Los registros de la API no tienen formato estructurado ni correlacion. | El diagnostico de incidentes en produccion sera lento. | Media | Pendiente | Agregar logging JSON e identificador por solicitud. |

Durante la semana 3 se seleccionaran al menos dos deudas para resolverlas en
ramas y Work Items independientes, conservando commit, PR, revision y pruebas.
