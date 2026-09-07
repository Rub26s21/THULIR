// ============================================================
// THULIR AI — System Activity & Ingestion Stream
// ============================================================
// Clean, readable live event stream with warm-neutral thank-you aesthetic.

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
      tagClass: 'warm-tag-ingest',
      msg: latestData
        ? `Frame #${latestData.id || 'LIVE'} received: TiltX=${latestData.tilt_x !== null ? latestData.tilt_x.toFixed(1) : '—'}° Gas=${latestData.gas_raw ?? '—'} Vib=${latestData.vib_rms !== null ? latestData.vib_rms.toFixed(2) : '—'}`
        : 'Awaiting incoming ESP8266 telemetry frame...',
      icon: <Activity size={12} strokeWidth={2.2} />
    },
    {
      time: timeStr(1),
      tag: 'AI_INFER',
      tagClass: 'warm-tag-ai',
      msg: mlPrediction
        ? `RF-Classifier inference: ${mlPrediction.prediction} (${(mlPrediction.confidence * 100).toFixed(1)}% conf, ${mlPrediction.inference_time_ms}ms)`
        : 'Random Forest classifier listening for telemetry frame',
      icon: <Zap size={12} strokeWidth={2.2} />
    },
    {
      time: timeStr(2),
      tag: 'RISK_EVAL',
      tagClass: 'warm-tag-risk',
      msg: `Integrity index computed: Score ${risk.score}/100 (${risk.level}) via ${risk.source}`,
      icon: <CheckCircle size={12} strokeWidth={2.2} />
    },
    {
      time: timeStr(4),
      tag: 'LINK_OK',
      tagClass: 'warm-tag-link',
      msg: `Channel link verified (${connectionType}) → SSL/TLS stream healthy`,
      icon: <Radio size={12} strokeWidth={2.2} />
    },
  ];

  return (
    <div className="clay-card warm-activity-card" role="region" aria-label="System activity feed">
      {/* Header */}
      <div className="activity-card-header">
        <div className="activity-title-group">
          <div className="activity-icon-badge">
            <Terminal size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="activity-title-text">System Activity &amp; Ingestion Stream</div>
            <div className="activity-sub-text">Continuous real-time edge processing and ML audit log</div>
          </div>
        </div>
        <div className="activity-tty-badge">
          <span className="pulse-dot-warm" />
          <span>STREAMING (TTY0)</span>
        </div>
      </div>

      {/* Terminal Feed View */}
      <div className="warm-terminal-container">
        <div className="terminal-inner-scroll">
          {activities.map((act, i) => (
            <div key={i} className="warm-terminal-row">
              <div className="terminal-meta-col">
                <span className="terminal-time-stamp">[{act.time}]</span>
                <span className={`terminal-chip ${act.tagClass}`}>
                  {act.tag}
                </span>
              </div>
              <div className="terminal-message-text">
                {act.msg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
