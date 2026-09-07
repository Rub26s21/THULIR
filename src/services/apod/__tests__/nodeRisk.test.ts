import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateNodeRiskScore } from '../nodeRisk.ts';

describe('A-POD: Node Risk Calculation (R_i)', () => {
  it('calculates exact normalized risk score: P_low=0.10, P_mod=0.20, P_high=0.70 -> R_i=0.80', () => {
    const score = calculateNodeRiskScore({ low: 0.10, moderate: 0.20, high: 0.70 });
    assert.strictEqual(score, 0.8);
  });

  it('calculates pure low risk: P_low=1.0, P_mod=0.0, P_high=0.0 -> R_i=0.0', () => {
    const score = calculateNodeRiskScore({ low: 1.0, moderate: 0.0, high: 0.0 });
    assert.strictEqual(score, 0.0);
  });

  it('calculates pure high risk: P_low=0.0, P_mod=0.0, P_high=1.0 -> R_i=1.0', () => {
    const score = calculateNodeRiskScore({ low: 0.0, moderate: 0.0, high: 1.0 });
    assert.strictEqual(score, 1.0);
  });

  it('calculates pure moderate risk: P_low=0.0, P_mod=1.0, P_high=0.0 -> R_i=0.5', () => {
    const score = calculateNodeRiskScore({ low: 0.0, moderate: 1.0, high: 0.0 });
    assert.strictEqual(score, 0.5);
  });

  it('handles un-normalized inputs gracefully by normalizing sum to 1.0', () => {
    // 20 + 20 + 60 = 100 -> normalized to 0.20, 0.20, 0.60 -> 0.0*0.2 + 0.5*0.2 + 1.0*0.6 = 0.70
    const score = calculateNodeRiskScore({ low: 20, moderate: 20, high: 60 });
    assert.strictEqual(score, 0.7);
  });

  it('handles null probabilities using fallback risk class', () => {
    assert.strictEqual(calculateNodeRiskScore(null, 'HIGH_RISK'), 0.85);
    assert.strictEqual(calculateNodeRiskScore(null, 'MODERATE_RISK'), 0.50);
    assert.strictEqual(calculateNodeRiskScore(null, 'LOW_RISK'), 0.10);
  });
});
