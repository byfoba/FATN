import crypto from 'crypto';
import { Tick } from './types';

export function dedupeTicks(ticks: Tick[]): Tick[] {
  const seen = new Set<string>();
  return ticks.filter((t) => {
    const key = `${t.ts}-${t.price}-${t.size}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function aggregate1s(ticks: Tick[]) {
  const grouped = new Map<string, Tick[]>();
  for (const tick of ticks) {
    const second = tick.ts.slice(0, 19) + 'Z';
    const list = grouped.get(second) ?? [];
    list.push(tick);
    grouped.set(second, list);
  }

  return [...grouped.entries()].map(([start, group]) => ({
    start_utc: start,
    end_utc: new Date(new Date(start).getTime() + 1000).toISOString(),
    open: group[0].price,
    high: Math.max(...group.map((g) => g.price)),
    low: Math.min(...group.map((g) => g.price)),
    close: group[group.length - 1].price,
    volume: group.reduce((sum, g) => sum + g.size, 0),
    tick_count: group.length,
  }));
}

export function createSnapshotId() {
  return crypto.randomUUID();
}
