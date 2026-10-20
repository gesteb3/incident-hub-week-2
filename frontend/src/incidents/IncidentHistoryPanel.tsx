import { useEffect, useState } from 'react';
import { fetchHistory, type IncidentHistory } from '../api';
import { errorMessage, formatDate, statusLabels } from './presentation';
import Feedback from './Feedback';

const eventLabels: Record<IncidentHistory['eventType'], string> = {
  CREATED: 'Incidente registrado', ASSIGNED: 'Técnico asignado', STATUS_CHANGED: 'Cambio de estado',
  COMMENTED: 'Comentario añadido', UPDATED: 'Datos actualizados',
};

function EventDetails({ item }: { item: IncidentHistory }) {
  const details = item.details;
  return <>
    {item.previousStatus && item.newStatus && item.previousStatus !== item.newStatus &&
      <div className="history-transition"><span>{statusLabels[item.previousStatus]}</span><span aria-hidden="true">→</span><strong>{statusLabels[item.newStatus]}</strong></div>}
    {typeof details?.technicianName === 'string' && <p>Responsable: {details.technicianName}</p>}
    {typeof details?.reason === 'string' && <p className="history-reason">{details.reason}</p>}
    {item.eventType === 'COMMENTED' && typeof details?.content === 'string' && <p>{details.content}</p>}
  </>;
}

export default function IncidentHistoryPanel({ incidentId, revision }: { incidentId: string; revision: number }) {
  const [items, setItems] = useState<IncidentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchHistory(incidentId, controller.signal).then((data) => {
      if (!controller.signal.aborted) setItems([...data].reverse());
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [incidentId, revision, retry]);

  return <section className="history-panel panel" aria-labelledby="history-title" aria-busy={loading}>
    <div className="panel-heading"><div><p className="eyebrow">ACTIVIDAD</p><h2 id="history-title">Historial del incidente</h2></div>
      <span className="count-pill">{items.length} {items.length === 1 ? 'evento' : 'eventos'}</span></div>
    {error ? <Feedback message={error} onRetry={() => setRetry((value) => value + 1)} />
      : loading ? <p className="muted-state">Actualizando historial…</p>
        : !items.length ? <p className="muted-state">No hay eventos registrados.</p>
          : <ol className="history-timeline">{items.map((item) => <li key={item.id}>
            <span className={`timeline-mark event-${item.eventType.toLowerCase()}`} aria-hidden="true">
              {item.eventType === 'CREATED' ? '+' : item.eventType === 'ASSIGNED' ? '↗' : item.eventType === 'COMMENTED' ? '·' : '✓'}
            </span>
            <article><div className="history-title"><strong>{eventLabels[item.eventType]}</strong><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div>
              <span className="history-actor">{item.actor?.name ?? 'Sistema'}</span><EventDetails item={item} />
            </article>
          </li>)}</ol>}
  </section>;
}
