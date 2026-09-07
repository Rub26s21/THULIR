import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSensorAgreement } from '../sensorAgreement.ts';
import type { SensorData } from '../../../types';

describe('A-POD: Sensor Agreement & Conflict Detection (M in [0, 1])', () => {
  const nominalTelemetry: SensorData = {
    id: 1,
    node_id: 'NODE_01',
    event_id: null,
    tilt_x: 0.5,
    tilt_y: -0.8,
    pressure: 989.2,
    gas_raw: 220,
    temperature: 24.5,
    humidity: 55,
    distance_cm: 60.0,
    vib_rms: 0.12,
    created_at: new Date().toISOString(),
  };

  it('evaluates high agreement when physical sensors match LOW_RISK ML prediction', () => {
    const res = calculateSensorAgreement(nominalTelemetry, 'LOW_RISK');
    assert.strictEqual(res.hasConflict, false);
    assert.ok(res.agreementScore >= 0.85);
    assert.strictEqual(res.supportingSignals.length, 8);
    assert.strictEqual(res.contradictingSignals.length, 0);
  });

  it('detects SENSOR_CONFLICT when vibration & gas are elevated without strata deformation', () => {
    const conflictTelemetry: SensorData = {
      ...nominalTelemetry,
      vib_rms: 20.5, // High vibration (> 1.5)
      gas_raw: 480,  // High gas (> 400)
      tilt_x: 0.2,   // Normal tilt
      tilt_y: 0.1,   // Normal tilt
      distance_cm: 60.0, // Normal roof distance
    };

    const res = calculateSensorAgreement(conflictTelemetry, 'HIGH_RISK');
    assert.strictEqual(res.hasConflict, true);
    assert.ok(res.conflictReason?.includes('vibration'));
  });

  it('STRICT INVARIANT: handles missing distance sensor safely without defaulting to 0 or OFFLINE', () => {
    const missingDistanceTelemetry: SensorData = {
      ...nominalTelemetry,
      distance_cm: null, // Distance sensor broken / unavailable
    };

    const res = calculateSensorAgreement(missingDistanceTelemetry, 'LOW_RISK');
    assert.strictEqual(res.missingSignals.length, 1);
    assert.ok(res.missingSignals[0].message.includes('unavailable'));
    assert.strictEqual(res.supportingSignals.length, 7); // Remaining 7 channels work!
  });
});
