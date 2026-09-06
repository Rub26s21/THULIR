// ============================================================
// THULIR - 4-Column Responsive Sensor Telemetry Grid
// ============================================================

import { SENSOR_META } from '../config/thresholds';
import { SensorCard } from './SensorCard';
import type { SensorData } from '../types';

interface SensorGridProps {
  data: SensorData | null;
  history?: SensorData[];
}

export function SensorGrid({ data, history }: SensorGridProps) {
  return (
    <div className="sensor-grid-4col" role="region" aria-label="Live Sensor Telemetry Grid">
      {SENSOR_META.map((meta) => {
        const rawValue = data ? (data[meta.key] as number | null) : null;

        return (
          <SensorCard
            key={meta.key}
            name={meta.name}
            value={rawValue}
            unit={meta.unit}
            hardware={meta.hardware}
            sensorKey={meta.key as string}
            precision={meta.precision}
            timestamp={data?.created_at || null}
            history={history}
          />
        );
      })}
    </div>
  );
}
