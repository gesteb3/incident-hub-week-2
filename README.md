# IT Incident Hub

Sistema web trazable para registrar, operar y dar seguimiento a incidentes de TI.

## Estado

Semana 1 - modelo de datos y módulos funcionales iniciales.

## Arquitectura

- `backend/`: API REST con Node.js, Express y TypeScript.
- `frontend/`: aplicación web con React y TypeScript.
- `database/`: migraciones y datos iniciales de PostgreSQL.
- `tests/`: pruebas de integración y extremo a extremo.
- `devops/`: recursos de automatización y despliegue.
- `docs/`: documentación técnica y evidencias verificables.

## Base de datos local

1. Copia `.env.example` como `.env` y cambia sus valores locales.
2. Inicia PostgreSQL:

```bash
docker compose up -d database
```

La migración y los datos iniciales se aplican automáticamente al crear el volumen por primera vez.

## Trazabilidad

El trabajo se realiza en ramas `feature/*`, `fix/*` o `refactor/*`. Los commits y Pull Requests deben incluir el identificador de Azure Boards con la sintaxis `AB#ID`.
