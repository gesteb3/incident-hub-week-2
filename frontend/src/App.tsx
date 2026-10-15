import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  demoUsers,
  fetchComments,
  fetchIncidents,
  postComment,
  type Incident,
  type IncidentComment,
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

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedId),
    [incidents, selectedId],
  );

  const loadComments = useCallback(async (incidentId: string) => {
    setLoadingComments(true);
    setError('');
    try {
      setComments(await fetchComments(incidentId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los comentarios.');
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchIncidents()
      .then((items) => {
        if (!active) return;
        setIncidents(items);
        const initialId = items.some((incident) => incident.id === requestedIncidentId)
          ? requestedIncidentId!
          : items[0]?.id ?? '';
        setSelectedId(initialId);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los incidentes.');
      })
      .finally(() => {
        if (active) setLoadingIncidents(false);
      });

    return () => {
      active = false;
    };
  }, [requestedIncidentId]);

  useEffect(() => {
    if (selectedId) void loadComments(selectedId);
    else setComments([]);
  }, [selectedId, loadComments]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !content.trim()) return;

    setSending(true);
    setError('');
    setNotice('');
    try {
      await postComment(selectedId, authorId, content.trim());
      setContent('');
      setNotice('Comentario agregado y registrado en la bitácora del incidente.');
      await loadComments(selectedId);
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
            <p className="subtitle">Mantén cada conversación y decisión junto al incidente.</p>
          </div>
          <div className="live-indicator"><span /> API conectada</div>
        </section>

        <section className="content-grid">
          <aside className="incident-panel panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Bandeja de trabajo</p>
                <h2>Incidentes</h2>
              </div>
              <span className="count-pill">{incidents.length}</span>
            </div>

            {loadingIncidents ? (
              <p className="muted-state">Cargando incidentes…</p>
            ) : incidents.length === 0 ? (
              <div className="empty-state compact"><span className="empty-icon">◇</span><strong>No hay incidentes</strong><span>Cuando se registre uno, aparecerá aquí.</span></div>
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
          </aside>

          <section className="detail-column">
            {selectedIncident ? (
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
                      <div className="empty-state"><span className="empty-icon">✳</span><strong>Inicia el seguimiento</strong><span>Agrega una nota para que el equipo tenga el contexto completo.</span></div>
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
                      placeholder="Comparte una actualización, hallazgo o siguiente paso…"
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
            {error && <div className="feedback feedback-error" role="alert"><strong>No se pudo completar la acción</strong><span>{error}</span><button onClick={() => selectedId && void loadComments(selectedId)} type="button">Reintentar</button></div>}
            {notice && <div className="feedback feedback-success" role="status"><span className="success-mark">✓</span><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')} type="button">×</button></div>}
          </section>
        </section>
        <footer className="page-footer"><span>IT Incident Hub</span><span>Seguimiento trazable · PostgreSQL</span></footer>
      </main>
    </div>
  );
}
