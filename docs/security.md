# Controles de seguridad

## Secretos y configuracion

- Los archivos `.env` y `.env.test` estan excluidos mediante `.gitignore`.
- `.env.example` contiene solamente valores de ejemplo y sirve como contrato de
  configuracion local.
- La aplicacion obtiene la conexion de PostgreSQL y el origen permitido de CORS
  desde variables de entorno.
- El repositorio no contiene archivos de claves privadas ni patrones conocidos
  de tokens revisados durante esta entrega.
- Los pipelines no imprimen ni almacenan credenciales en sus archivos YAML.

En ambientes compartidos, los valores reales deben configurarse como variables
secretas de Azure Pipelines o mediante un grupo de variables conectado a Azure
Key Vault. En GitHub deben almacenarse como Actions secrets.

## Controles automatizados

- Instalacion reproducible mediante `npm ci` y archivos lock versionados.
- Compilacion de TypeScript para detectar incompatibilidades.
- Validacion del esquema y generacion del cliente Prisma.
- Pruebas automatizadas del backend.
- `npm audit --audit-level=high` para backend y frontend.
- Permiso `contents: read` para el token del workflow de GitHub Actions.

## Riesgos pendientes

La version actual no implementa autenticacion ni autorizacion por rol. Durante
la demostracion se utilizan usuarios de datos iniciales. Esta limitacion se
registra como deuda tecnica y debe resolverse antes de exponer la aplicacion en
Internet.
