# Operación de incidentes desde la interfaz

## Alcance y trazabilidad

Rama: `feature/AB#20-operacion-frontend`.

Work Items relacionados: AB#17 (registro), AB#19 (historial), AB#20
(asignación), AB#21 (estados) y AB#29 (pruebas del frontend, DT-01).
Este cambio completa sus interfaces gráficas sobre los servicios REST existentes.

## Uso

1. Abrir `http://localhost:5173/`. Seleccionar **Trabajar como** con el usuario
   que realizará las operaciones. Los usuarios, técnicos y categorías provienen
   de `/api/catalogs`; no se mantienen identidades de ejemplo en el código React.
2. Pulsar **Nuevo incidente**. Completar título (5–160 caracteres), descripción
   (10–5000), categoría, prioridad y reportante. Los campos se validan también
   después de quitar espacios. El reporte se guarda en estado Nuevo.
3. Seleccionar un técnico responsable y pulsar **Asignar técnico**. El estado
   cambia a Asignado; una reasignación posterior conserva el estado actual.
4. Pulsar **Iniciar atención** para pasar a En proceso.
5. Describir la solución aplicada (10–1000 caracteres) y pulsar **Resolver incidente**.
6. Escribir cómo se validó la solución y pulsar **Cerrar incidente**. La interfaz
   deja de ofrecer cambios de estado y reasignaciones para el incidente cerrado.
7. Consultar comentarios e historial. Ambos conservan autor y fecha. El historial
   incluye creación, asignación, cambios de estado y motivos. Se permiten notas
   posteriores al cierre para dejar aclaraciones.

El selector de usuario es parte de la demostración local, **no es inicio de sesión**.
Las comprobaciones visuales de rol no constituyen autorización: la API realiza
sus validaciones existentes de actor activo y rol, pero aún debe autenticar la
identidad antes de un despliegue público (DT-02).

## Organización del frontend

- `App.tsx`: navegación entre bandeja e indicadores.
- `incidents/IncidentWorkspace.tsx`: consulta paginada, selección y contexto de usuario.
- `incidents/useCatalogs.ts`: una carga compartida de catálogos y reintento.
- `incidents/CreateIncidentDialog.tsx`: formulario en un diálogo nativo, manejo de
  foco y Escape, bloqueo durante el envío y conservación de datos ante errores.
- `incidents/IncidentDetail.tsx`: consulta independiente del detalle, incluso si
  el enlace apunta a un reporte fuera de la página actual; coordinación de operaciones.
- `incidents/IncidentOperations.tsx`: asignación, siguiente transición y motivo.
- `incidents/IncidentComments.tsx`: comentarios con paginación de 20 registros,
  publicación con el usuario de trabajo y navegación a la página de la nueva nota.
- `incidents/IncidentHistoryPanel.tsx`: bitácora con eventos recientes primero.
- `incidents/presentation.ts`: etiquetas, fechas y presentación de estados.
- `api.ts`: contratos tipados y acceso HTTP centralizado.

Las consultas se cancelan al cambiar de incidente o filtros. Los guardados
bloquean otras operaciones y el cambio de selección mientras están en curso.
Al modificar un reporte, se actualizan detalle, bandeja e historial. Si deja de
coincidir con un filtro, su detalle continúa abierto y se indica que está fuera
de los resultados. **Actualizar incidente** permite recuperar el estado vigente.
La API sigue siendo la autoridad para aceptar o rechazar las transiciones.

El diseño usa los verdes del dashboard, estados diferenciados, un recorrido de
cinco etapas, campos etiquetados y avisos de éxito y error. Los paneles se apilan
en pantallas estrechas; se respeta la preferencia de movimiento reducido.

## Verificación ejecutada

- Backend: 36 pruebas aprobadas y compilación correcta. El catálogo incorpora
  usuarios activos con identificador, nombre y rol, sin añadir correos.
- Frontend: nueve pruebas automatizadas con Vitest, Testing Library y jsdom;
  compilación de producción correcta. Las pruebas no requieren PostgreSQL.
- Casos automatizados: datos conservados ante fallo de registro; espacios
  rechazados; asignación y prevención de doble envío; motivo requerido al
  resolver; motivo conservado ante conflicto; acciones ocultas al solicitante;
  cierre terminal; enlace directo fuera de la página; comentario en página final.
- Recorrido real en navegador: registro → asignación → inicio de atención →
  resolución con motivo → cierre con confirmación → comentario → historial.
  Datos persistidos mediante los servicios REST y PostgreSQL local.
- Revisión visual a 1440 × 1000 y 390 × 844: formulario, recorrido de estados,
  comentarios e historial utilizables sin desplazamiento horizontal de la página.

Comandos desde las carpetas correspondientes:

```powershell
npm test
npm run build
```

Azure Pipelines y GitHub Actions incluyen ahora el paso de pruebas del frontend.
Su ejecución remota debe comprobarse después de abrir el PR correspondiente.

## Capturas para el informe

1. Formulario **Nuevo incidente** con categoría, prioridad y reportante visibles.
   Título: **Registro de incidentes desde la mesa de ayuda**.
2. Detalle de un incidente asignado o en proceso, responsable y recorrido de etapas.
   Título: **Asignación de responsables y atención del incidente**.
3. Incidente cerrado y bitácora con motivos, responsables y fechas.
   Título: **Cierre del incidente y consulta de la bitácora de atención**.
4. PR aprobado y completado, con los Work Items vinculados y validaciones reales.
   Título: **Revisión e integración del flujo operativo**.

Descripción sugerida:

> Se completó la gestión de incidentes desde la aplicación web: registro del
> reporte, asignación de técnico, inicio de atención, resolución y cierre. La
> bitácora conserva cada cambio con responsable, fecha y motivo, mientras que
> los comentarios permiten documentar el seguimiento. Los datos se mantienen
> al recargar la página y las validaciones impiden avanzar sin la información
> necesaria.
