import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateNodeReliability, getFreshnessFactor } from '../reliability.ts';

describe('A-POD: Node Reliability (Q_i = H_i * C_i * D_i)', () => {
  it('calculates perfect reliability: H=1.0, C=1.0, D=1.0 -> Q_i=1.0', () => {
    const q = calculateNodeReliability({
      nodeHealth: 1.0,
      mlConfidence: 1.0,
      dataFreshness: 1.0,
      freshnessState: 'FRESH',
      isOnline: true,
    });
    assert.strictEqual(q, 1.0);
  });

  it('reduces reliability with degraded factors: H=0.8, C=0.9, D=0.75 -> Q_i=0.54', () => {
    const q = calculateNodeReliability({
      nodeHealth: 0.8,
      mlConfidence: 0.9,
      dataFreshness: 0.75,
      freshnessState: 'RECENT',
      isOnline: true,
    });
    assert.strictEqual(q, 0.54);
  });

  it('STRICT INVARIANT: offline node has Q_i = 0.0 and D_i = 0.0', () => {
    const freshnessFactor = getFreshnessFactor('OFFLINE');
    assert.strictEqual(freshnessFactor, 0.0);

    const q = calculateNodeReliability({
      nodeHealth: 1.0,
      mlConfidence: 1.0,
      dataFreshness: 0.0,
      freshnessState: 'OFFLINE',
      isOnline: false,
    });
    assert.strictEqual(q, 0.0);
  });

  it('clamps values out of [0, 1] range to valid bounds', () => {
    const q = calculateNodeReliability({
      nodeHealth: 1.5,
      mlConfidence: 2.0,
      dataFreshness: 1.2,
      freshnessState: 'FRESH',
      isOnline: true,
    });
    assert.strictEqual(q, 1.0);
  });
});
