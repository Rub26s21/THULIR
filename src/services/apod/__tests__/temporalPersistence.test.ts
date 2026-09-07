import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateTemporalPersistence } from '../temporalPersistence.ts';

describe('A-POD: Temporal Persistence & Trend (T in [0, 1])', () => {
  it('detects RISING trend with increasing risk across time: [0.22, 0.28, 0.37, 0.48, 0.61]', () => {
    const series = [0.22, 0.28, 0.37, 0.48, 0.61];
    const res = calculateTemporalPersistence(series, 0.50);
    assert.strictEqual(res.riskTrend, 'RISING');
    assert.ok(res.rateOfChange > 0.04);
  });

  it('detects FALLING trend with decreasing risk across time: [0.72, 0.71, 0.65, 0.52, 0.38]', () => {
    const series = [0.72, 0.71, 0.65, 0.52, 0.38];
    const res = calculateTemporalPersistence(series, 0.50);
    assert.strictEqual(res.riskTrend, 'FALLING');
    assert.ok(res.rateOfChange < -0.04);
  });

  it('detects STABLE elevated persistence: [0.75, 0.76, 0.75, 0.74, 0.75]', () => {
    const series = [0.75, 0.76, 0.75, 0.74, 0.75];
    const res = calculateTemporalPersistence(series, 0.50);
    assert.strictEqual(res.riskTrend, 'STABLE');
    assert.strictEqual(res.consecutiveElevatedCount, 5);
    assert.ok(res.temporalScore >= 0.90);
  });

  it('handles empty history by returning UNKNOWN with 0 persistence', () => {
    const res = calculateTemporalPersistence([]);
    assert.strictEqual(res.temporalScore, 0.0);
    assert.strictEqual(res.riskTrend, 'UNKNOWN');
  });
});
