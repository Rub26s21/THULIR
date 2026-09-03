// ============================================================
// THULIR - Error State Component
// ============================================================

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Connection Error',
  message = 'Unable to connect to Supabase. Check your environment configuration and network connection.',
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-container" role="alert">
      <AlertTriangle className="state-icon" style={{ color: 'var(--status-critical)' }} />
      <div className="state-title">{title}</div>
      <div className="state-message">{message}</div>
      {error && <div className="state-error">{error}</div>}
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Retry Connection
        </button>
      )}
    </div>
  );
}
