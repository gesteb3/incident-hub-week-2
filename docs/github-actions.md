# Validacion complementaria de pull requests

El workflow `.github/workflows/pr-validation.yml` verifica los cambios propuestos
a `main` en GitHub. Instala dependencias con los archivos lock, genera y valida
el cliente Prisma, compila ambos proyectos, ejecuta las pruebas del backend y
revisa dependencias con `npm audit --audit-level=high`.

La ejecucion usa permisos de lectura y no requiere credenciales de base de
datos: la validacion del esquema toma la URL de ejemplo, y las pruebas actuales
no se conectan a PostgreSQL.

Azure Repos conserva el historial principal y Azure Pipelines publica el
artefacto. Para demostrar este control adicional, el mismo codigo debe estar
en un repositorio de GitHub y el pull request de prueba debe dirigirse a su
rama `main`. El archivo YAML por si solo no ejecuta GitHub Actions dentro de
Azure Repos.

Para la evidencia, guardar el enlace al pull request de GitHub y a su
ejecucion en la pestaña **Actions**, con el resultado de cada paso visible.
