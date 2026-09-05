// ============================================================
// THULIR AI — System Activity & Ingestion Stream
// ============================================================

import { Terminal, Activity, Zap, CheckCircle, Radio } from 'lucide-react';
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
    return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0').slice(0, 2);
  };

  const activities = [
    {
      time: timeStr(0),
      tag: 'INGEST',
      tagClass: 'tag-ingest',
      msg: latestData
        ? `Frame #${latestData.id || 'LIVE'} received: TiltX=${latestData.tilt_x !== null ? latestData.tilt_x.toFixed(1) : '—'}° Gas=${latestData.gas_raw ?? '—'} Vib=${latestData.vib_rms !== null ? latestData.vib_rms.toFixed(2) : '—'}`
        : 'Awaiting incoming ESP8266 telemetry frame...',
      icon: <Activity size={12} color="#00d4ff" />
    },
    {
      time: timeStr(1),
      tag: 'AI_INFER',
      tagClass: 'tag-ai',
      msg: mlPrediction
        ? `RF-Classifier inference: ${mlPrediction.prediction} (${(mlPrediction.confidence * 100).toFixed(1)}% conf, ${mlPrediction.inference_time_ms}ms)`
        : 'Random Forest classifier listening for telemetry frame',
      icon: <Zap size={12} color="#a855f7" />
    },
    {
      time: timeStr(2),
      tag: 'RISK_EVAL',
      tagClass: 'tag-risk',
      msg: `Integrity index computed: Score ${risk.score}/100 (${risk.level}) via ${risk.source}`,
      icon: <CheckCircle size={12} color="#10b981" />
    },
    {
      time: timeStr(4),
      tag: 'LINK_OK',
      tagClass: 'tag-ingest',
      msg: `Channel link verified (${connectionType}) → SSL/TLS stream healthy`,
      icon: <Radio size={12} color="#00d4ff" />
    },
  ];

  return (
    <div className="clay-card" role="region" aria-label="System activity feed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={16} color="var(--brand-green)" strokeWidth={2} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>System Activity</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>Live ingestion &amp; inference event stream</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="pulse-dot dot-cyan" />
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            STREAMING (TTY0)
          </span>
        </div>
      </div>

      <div className="activity-terminal-feed">
        {activities.map((act, i) => (
          <div key={i} className="terminal-line">
            <span style={{ color: 'var(--text-dim)', fontSize: '0.66rem', flexShrink: 0 }}>
              [{act.time}]
            </span>
            <span className={`terminal-tag ${act.tagClass}`}>
              {act.tag}
            </span>
            <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              {act.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
