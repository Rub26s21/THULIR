// ============================================================
// THULIR - Empty State Component
// ============================================================

import { Radio } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'No Live Sensor Data',
  message = 'NODE_01 has not transmitted recent measurements. Ensure the ESP8266 is powered on, connected to Wi-Fi, and posting to Supabase.',
}: EmptyStateProps) {
  return (
    <div className="state-container" role="status">
      <Radio className="state-icon" />
      <div className="state-title">{title}</div>
      <div className="state-message">{message}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 8 }}>
        Try enabling Demo Mode to preview the dashboard with simulated data.
      </div>
    </div>
  );
}
