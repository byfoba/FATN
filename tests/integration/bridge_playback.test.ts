import { describe, expect, it } from 'vitest';
import { loadTicksFromCsv } from '../../bridge/src/adapters/playbackAdapter';

describe('bridge playback', () => {
  it('loads fixture ticks', () => {
    const ticks = loadTicksFromCsv('tests/fixtures/sample_ticks.csv');
    expect(ticks.length).toBeGreaterThan(10);
    expect(ticks[0].price).toBeTypeOf('number');
  });
});
