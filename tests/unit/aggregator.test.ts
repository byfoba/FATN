import { describe, expect, it } from 'vitest';
import { aggregate1s, dedupeTicks } from '../../bridge/src/core/aggregator';

describe('aggregator', () => {
  it('dedupes ticks and aggregates 1s bars', () => {
    const ticks = [
      { ts: '2026-03-04T12:00:00.000Z', price: 100, size: 1 },
      { ts: '2026-03-04T12:00:00.000Z', price: 100, size: 1 },
      { ts: '2026-03-04T12:00:00.500Z', price: 101, size: 2 },
    ];
    const deduped = dedupeTicks(ticks);
    expect(deduped).toHaveLength(2);
    const bars = aggregate1s(deduped);
    expect(bars).toHaveLength(1);
    expect(bars[0].open).toBe(100);
    expect(bars[0].close).toBe(101);
  });
});
