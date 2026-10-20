import { useEffect, useState } from 'react';
import { fetchIncident, type Catalogs, type Incident, type User } from '../api';
import { errorMessage, formatDate, priorityLabels, statusLabels } from './presentation';
import Feedback from './Feedback';
import IncidentComments from './IncidentComments';
import IncidentHistoryPanel from './IncidentHistoryPanel';
import IncidentOperations from './IncidentOperations';

type Props = {
  id: string; actor?: User; catalogs: Catalogs; onChanged: () => void; onBusy: (busy: boolean) => void;
};

export default function IncidentDetail({ id, actor, catalogs, onChanged, onBusy }: Props) {
  const [incident, setIncident] = useState<Incident>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [historyRevision, setHistoryRevision] = useState(0);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  function updateBusy(value: boolean) { setBusy(value); onBusy(value); }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchIncident(id, controller.signal).then((item) => {
      if (!controller.signal.aborted) setIncident(item);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);

  if (error) return <Feedback message={error} onRetry={() => setRevision((value) => value + 1)} />;
  if (loading || !incident) return <div className="panel detail-loading" role="status"><span className="loading-pulse" />Cargando detalle…</div>;

  return <>
    <article className="incident-summary panel">
      <div className="summary-topline"><span className="incident-reference">INCIDENTE · {incident.id.slice(0, 8).toUpperCase()}</span>
        <div className="summary-actions"><button type="button" className="secondary-button" disabled={busy} onClick={() => {
          setRevision((value) => value + 1); setHistoryRevision((value) => value + 1);
        }}>Actualizar incidente</button><span className={`status-chip status-${incident.status.toLowerCase()}`}>{statusLabels[incident.status]}</span></div></div>
      <h2>{incident.title}</h2><p className="incident-description">{incident.description}</p>
      <div className="summary-meta">
        <span><small>Categoría</small><strong>{incident.category.name}</strong></span>
        <span><small>Prioridad</small><strong className={`priority-text-${incident.priority.toLowerCase()}`}>{priorityLabels[incident.priority]}</strong></span>
        <span><small>Reportado por</small><strong>{incident.reporter.name}</strong></span>
        <span><small>Técnico asignado</small><strong>{incident.technician?.name ?? 'Sin asignar'}</strong></span>
      </div><p className="reported-at">Registrado el <time dateTime={incident.createdAt}>{formatDate(incident.createdAt)}</time></p>
    </article>
    {notice && <div className="feedback feedback-success" role="status"><span className="success-mark">✓</span><span>{notice}</span>
      <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}>×</button></div>}
    <IncidentOperations key={`${id}:${incident.status}:${incident.technician?.id ?? ''}`} incident={incident} actor={actor}
      technicians={catalogs.technicians} disabled={busy} onBusy={updateBusy} onChanged={(updated) => {
        setIncident(updated); setHistoryRevision((value) => value + 1); setNotice('Cambios guardados en el incidente.'); onChanged();
      }} />
    <IncidentComments incidentId={id} actor={actor} disabled={busy} onBusy={updateBusy} onCommented={() => setHistoryRevision((value) => value + 1)} />
    <IncidentHistoryPanel incidentId={id} revision={historyRevision} />
  </>;
}
