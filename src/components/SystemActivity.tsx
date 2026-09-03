// ============================================================
// THULIR - macOS Skeuomorphic Live System Activity Component
// ============================================================

import { Terminal, Activity, Zap, CheckCircle } from 'lucide-react';
import type { SensorData, MLPrediction, RiskState } from '../types';

interface SystemActivityProps {
  latestData: SensorData | null;
  mlPrediction: MLPrediction | null;
  risk: RiskState;
  connectionType: string;
}

export function SystemActivity({ latestData, mlPrediction, risk, connectionType }: SystemActivityProps) {
  const now = new Date();
  const timeStr = (offsetSec: number = 0) => {
    const d = new Date(now.getTime() - offsetSec * 1000);
    return d.toLocaleTimeString();
  };

  const activities = [
    {
      time: timeStr(0),
      msg: latestData ? `Telemetry frame ingested from ${latestData.node_id}` : 'Telemetry listener active...',
      icon: <Activity size={12} color="var(--accent-cyan)" />
    },
    {
      time: timeStr(0),
      msg: mlPrediction
        ? `ML Inference completed (${mlPrediction.prediction}, ${mlPrediction.inference_time_ms}ms)`
        : 'ML inference engine initialized',
      icon: <Zap size={12} color="#8b5cf6" />
    },
    {
      time: timeStr(1),
      msg: `Risk state evaluated as ${risk.level} (Score: ${risk.score}/100)`,
      icon: <CheckCircle size={12} color="var(--status-normal)" />
    },
    {
      time: timeStr(3),
      msg: `Channel link verified: ${connectionType}`,
      icon: <Terminal size={12} color="var(--text-muted)" />
    },
  ];

  return (
    <div className="skeuo-card" role="region" aria-label="System activity feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live System Activity
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          EVENT LOG
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map((act, i) => (
          <div
            key={i}
            className="skeuo-well"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              fontSize: '0.74rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {act.icon}
              <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {act.msg}
              </span>
            </div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
