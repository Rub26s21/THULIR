// ============================================================
// THULIR - Loading State Component
// ============================================================

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="state-container" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <div className="state-title">{message}</div>
    </div>
  );
}
