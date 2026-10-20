export default function Feedback({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="feedback feedback-error" role="alert"><span>{message}</span>
    {onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}
  </div>;
}
