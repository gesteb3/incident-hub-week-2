import { useEffect, useMemo, useState, type FormEvent } from 'react';
import IncidentFiltersForm from './IncidentFiltersForm';
import {
  demoUsers,
  fetchComments,
  fetchIncidents,
  postComment,
  type Incident,
  type IncidentComment,
  type IncidentFilters,
  type Pagination,
} from './api';

const statusLabels: Record<Incident['status'], string> = {
  NUEVO: 'Nuevo',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};

const priorityLabels: Record<Incident['priority'], string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function App() {
  const requestedIncidentId = new URLSearchParams(window.location.search).get('incidentId');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState(requestedIncidentId ?? '');
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [authorId, setAuthorId] = useState(demoUsers[1].id);
  const [content, setContent] = useState('');
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [listError, setListError] = useState('');
  const [query, setQuery] = useState<IncidentFilters & { page: number; limit: number }>({ page: 1, limit: 10 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [listReload, setListReload] = useState(0);
  const [commentReload, setCommentReload] = useState(0);
  const hasFilters = !!(query.status || query.priority || query.categoryId || query.technicianId);

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedId),
    [incidents, selectedId],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoadingIncidents(true);
    setListError('');
    fetchIncidents(query, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setIncidents(result.data);
        setPagination(result.meta);
        setSelectedId((current) => result.data.some((incident) => incident.id === current)
          ? current : result.data[0]?.id ?? '');
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setListError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los incidentes.');
          setIncidents([]);
          setSelectedId('');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingIncidents(false);
      });
    return () => controller.abort();
  }, [query, listReload]);

  useEffect(() => {
    const controller = new AbortController();
    setComments([]);
    setError('');
    if (!selectedId) { setLoadingComments(false); return; }
    setLoadingComments(true);
    fetchComments(selectedId, controller.signal)
      .then((items) => { if (!controller.signal.aborted) setComments(items); })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los comentarios.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingComments(false); });
    return () => controller.abort();
  }, [selectedId, commentReload]);

  useEffect(() => { setContent(''); setNotice(''); }, [selectedId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !content.trim()) return;

    setSending(true);
    setError('');
    setNotice('');
    try {
      await postComment(selectedId, authorId, content.trim());
      setContent('');
      setNotice('Comentario guardado.');
      setCommentReload((value) => value + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el comentario.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="IT Incident Hub, inicio">
          <span className="brand-mark">IH</span>
          <span>IT Incident Hub</span>
        </a>
        <span className="topbar-label">Centro de soporte</span>
        <span className="avatar" title="Usuario activo">GB</span>
      </header>

      <main className="workspace">
        <section className="page-heading">
          <div>
            <p className="eyebrow">OPERACIONES · SEGUIMIENTO</p>
            <h1>Incidentes de TI</h1>
            <p className="subtitle">Consulta los reportes y el avance de su atención.</p>
          </div>
          <div className={`live-indicator ${listError ? 'connection-error' : ''}`} role="status"><span /> {loadingIncidents ? 'Actualizando…' : listError ? 'Sin actualizar' : 'Datos actualizados'}</div>
        </section>

        <IncidentFiltersForm disabled={loadingIncidents || sending} onApply={(filters) => {
          setQuery({ ...filters, page: 1, limit: query.limit });
          setNotice('');
        }} />

        <section className="content-grid">
          <aside className="incident-panel panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Bandeja de trabajo</p>
                <h2>Incidentes</h2>
              </div>
              <span className="count-pill" aria-label="Total de incidentes">{loadingIncidents || listError ? '—' : pagination.total}</span>
            </div>

            {loadingIncidents ? (
              <p className="muted-state">Cargando incidentes…</p>
            ) : listError ? (
              <div className="feedback feedback-error" role="alert"><strong>No se pudieron cargar los incidentes</strong><span>{listError}</span><button type="button" onClick={() => setListReload((value) => value + 1)}>Reintentar</button></div>
            ) : incidents.length === 0 ? (
              <div className="empty-state compact"><span className="empty-icon">◇</span><strong>{hasFilters ? 'No hay coincidencias' : 'No hay incidentes'}</strong><span>{hasFilters ? 'Prueba otros filtros o pulsa Limpiar.' : 'Los reportes registrados aparecerán aquí.'}</span></div>
            ) : (
              <div className="incident-list" role="listbox" aria-label="Seleccionar incidente">
                {incidents.map((incident) => (
                  <button
                    aria-selected={incident.id === selectedId}
                    className={`incident-card ${incident.id === selectedId ? 'selected' : ''}`}
                    key={incident.id}
                    onClick={() => { setSelectedId(incident.id); setNotice(''); }}
                    role="option"
                    type="button"
                    disabled={sending}
                  >
                    <span className={`priority-dot priority-${incident.priority.toLowerCase()}`} />
                    <span className="incident-card-copy">
                      <strong>{incident.title}</strong>
                      <span>{incident.category.name} · {dateFormatter.format(new Date(incident.createdAt))}</span>
                    </span>
                    <span className={`status-chip status-${incident.status.toLowerCase()}`}>{statusLabels[incident.status]}</span>
                  </button>
                ))}
              </div>
            )}
            <nav className="pagination" aria-label="Páginas de incidentes">
              <div className="pagination-size"><label htmlFor="page-size">Por página</label><select id="page-size" value={query.limit} disabled={loadingIncidents || sending}
                onChange={(event) => setQuery({ ...query, page: 1, limit: Number(event.target.value) })}>
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select></div>
              <span aria-live="polite">{loadingIncidents ? 'Cargando…' : listError ? '—' : pagination.total === 0 ? '0 resultados' : `Página ${pagination.page} de ${pagination.totalPages}`}</span>
              <div className="pagination-buttons">
                <button className="secondary-button" type="button" aria-label="Página anterior" disabled={loadingIncidents || sending || !!listError || query.page <= 1}
                  onClick={() => setQuery({ ...query, page: query.page - 1 })}>Anterior</button>
                <button className="secondary-button" type="button" aria-label="Página siguiente" disabled={loadingIncidents || sending || !!listError || query.page >= pagination.totalPages}
                  onClick={() => setQuery({ ...query, page: query.page + 1 })}>Siguiente</button>
              </div>
            </nav>
          </aside>

          <section className="detail-column">
            {!loadingIncidents && selectedIncident ? (
              <>
                <article className="incident-summary panel">
                  <div className="summary-topline">
                    <span className="incident-reference">INCIDENTE · {selectedIncident.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`status-chip status-${selectedIncident.status.toLowerCase()}`}>{statusLabels[selectedIncident.status]}</span>
                  </div>
                  <h2>{selectedIncident.title}</h2>
                  <p className="incident-description">{selectedIncident.description}</p>
                  <div className="summary-meta">
                    <span><small>Categoría</small><strong>{selectedIncident.category.name}</strong></span>
                    <span><small>Prioridad</small><strong className={`priority-text priority-text-${selectedIncident.priority.toLowerCase()}`}>{priorityLabels[selectedIncident.priority]}</strong></span>
                    <span><small>Reportado por</small><strong>{selectedIncident.reporter.name}</strong></span>
                    <span><small>Técnico asignado</small><strong>{selectedIncident.technician?.name ?? 'Sin asignar'}</strong></span>
                  </div>
                </article>

                <section className="conversation panel" aria-labelledby="conversation-title">
                  <div className="panel-heading conversation-heading">
                    <div>
                      <p className="eyebrow">HISTORIAL COMPARTIDO</p>
                      <h2 id="conversation-title">Seguimiento</h2>
                    </div>
                    <span className="count-pill">{comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}</span>
                  </div>

                  <div className="comment-list" aria-live="polite">
                    {loadingComments ? (
                      <p className="muted-state">Cargando seguimiento…</p>
                    ) : comments.length === 0 ? (
                      <div className="empty-state"><span className="empty-icon">✳</span><strong>Sin comentarios</strong><span>Registra una nota sobre la atención del incidente.</span></div>
                    ) : comments.map((comment) => (
                      <article className="comment" key={comment.id}>
                        <div className="comment-avatar">{comment.author.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                        <div className="comment-body">
                          <div className="comment-meta"><strong>{comment.author.name}</strong><span>{dateFormatter.format(new Date(comment.createdAt))}</span></div>
                          <p>{comment.content}</p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <form className="comment-form" onSubmit={handleSubmit}>
                    <label htmlFor="author">Comentar como</label>
                    <select id="author" value={authorId} onChange={(event) => setAuthorId(event.target.value)}>
                      {demoUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <label className="sr-only" htmlFor="comment-content">Escribe una actualización</label>
                    <textarea
                      id="comment-content"
                      maxLength={2000}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Escribe una nota de seguimiento…"
                      required
                      rows={3}
                      value={content}
                    />
                    <div className="form-footer">
                      <span>{content.length}/2000 · Se añadirá a la bitácora</span>
                      <button className="submit-button" disabled={sending || !content.trim()} type="submit">
                        {sending ? 'Guardando…' : 'Publicar comentario'}
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </form>
                </section>
              </>
            ) : (
              <div className="panel empty-detail"><span className="empty-icon">◇</span><strong>{loadingIncidents ? 'Preparando bandeja…' : 'Selecciona un incidente'}</strong><span>El detalle y el seguimiento aparecerán aquí.</span></div>
            )}
            {error && <div className="feedback feedback-error" role="alert"><strong>No se pudo completar la acción</strong><span>{error}</span><button disabled={sending} onClick={() => setCommentReload((value) => value + 1)} type="button">Recargar comentarios</button></div>}
            {notice && <div className="feedback feedback-success" role="status"><span className="success-mark">✓</span><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')} type="button">×</button></div>}
          </section>
        </section>
        <footer className="page-footer"><span>IT Incident Hub</span><span>Mesa de ayuda · Gestión de incidentes</span></footer>
      </main>
    </div>
  );
}
