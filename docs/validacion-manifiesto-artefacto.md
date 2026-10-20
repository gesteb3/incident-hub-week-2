# Validación de manifiesto de artefacto

El proceso de empaquetado exige un manifiesto que identifique los contenidos
requeridos para la entrega. Azure Pipelines valida su presencia antes de
generar el artefacto publicable.

El manifiesto se conserva junto a la configuración DevOps y se incluye en el
artefacto para facilitar la revisión de los componentes entregados.

La versión inicial del manifiesto incorpora el backend compilado, la interfaz
web compilada, la base de datos, la configuración de contenedores y la guía
de ejecución.
