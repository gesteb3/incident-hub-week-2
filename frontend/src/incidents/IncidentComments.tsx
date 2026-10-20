import { useEffect, useState, type FormEvent } from 'react';
import { fetchCommentsPage, postComment, type IncidentComment, type Pagination, type User } from '../api';
import { errorMessage, formatDate, initials } from './presentation';
import Feedback from './Feedback';

type Props = { incidentId: string; actor?: User; onCommented: () => void; onBusy: (busy: boolean) => void; disabled?: boolean };

export default function IncidentComments({ incidentId, actor, onCommented, onBusy, disabled = false }: Props) {
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [meta, setMeta] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchCommentsPage(incidentId, page, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setComments(result.data);
      setMeta(result.meta);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [incidentId, page, revision]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actor || sending || disabled || !content.trim()) return;
    setSending(true);
    onBusy(true);
    setSendError('');
    setNotice('');
    try {
      await postComment(incidentId, actor.id, content.trim());
      setContent('');
      setNotice('Comentario guardado.');
      // Reabrir la última página permite ver la nota recién guardada.
      setPage(error ? 1 : Math.ceil((meta.total + 1) / meta.limit));
      setRevision((value) => value + 1);
      onCommented();
    } catch (cause) { setSendError(errorMessage(cause)); }
    finally { setSending(false); onBusy(false); }
  }

  return <section className="conversation panel" aria-labelledby="conversation-title">
    <div className="panel-heading conversation-heading"><div><p className="eyebrow">NOTAS DE ATENCIÓN</p><h2 id="conversation-title">Comentarios</h2></div>
      <span className="count-pill">{meta.total} {meta.total === 1 ? 'comentario' : 'comentarios'}</span></div>
    {error ? <Feedback message={error} onRetry={() => setRevision((value) => value + 1)} />
      : <div className="comment-list" aria-busy={loading}>
        {loading ? <p className="muted-state">Cargando comentarios…</p>
          : !comments.length ? <div className="empty-state"><span className="empty-icon" aria-hidden="true">✳</span><strong>Sin comentarios</strong><span>Registra una nota sobre la atención del incidente.</span></div>
            : comments.map((comment) => <article className="comment" key={comment.id}>
              <div className="comment-avatar" aria-hidden="true">{initials(comment.author.name)}</div>
              <div className="comment-body"><div className="comment-meta"><strong>{comment.author.name}</strong><time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time></div><p>{comment.content}</p></div>
            </article>)}
      </div>}
    {meta.totalPages > 1 && <nav className="comment-pagination" aria-label="Páginas de comentarios">
      <button type="button" className="secondary-button" disabled={loading || sending || page <= 1} onClick={() => setPage(page - 1)}>Anteriores</button>
      <span>{meta.page} / {meta.totalPages}</span>
      <button type="button" className="secondary-button" disabled={loading || sending || page >= meta.totalPages} onClick={() => setPage(page + 1)}>Más recientes</button>
    </nav>}
    <form className="comment-form" aria-label="Añadir comentario" onSubmit={submit}>
      <label htmlFor="comment-content">Nueva nota {actor && <span className="commenting-as">· {actor.name}</span>}</label>
      <textarea id="comment-content" required maxLength={2000} rows={3} value={content} disabled={sending || disabled || !actor}
        placeholder="Escribe una nota de seguimiento…" onChange={(event) => setContent(event.target.value)} />
      <div className="form-footer"><span>{content.length}/2000 · Se añadirá al historial</span>
        <button className="submit-button" type="submit" disabled={sending || disabled || !actor || !content.trim()}>{sending ? 'Guardando…' : 'Publicar comentario'}<span aria-hidden="true">↗</span></button></div>
      {sendError && <Feedback message={sendError} />}
      {notice && <p className="inline-success" role="status">✓ {notice}</p>}
    </form>
  </section>;
}
