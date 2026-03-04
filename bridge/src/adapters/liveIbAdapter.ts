import { Tick } from '../core/types';

export async function* liveIbTicks(): AsyncGenerator<Tick> {
  // TODO: integrate IB Gateway/TWS API client and emit real ticks.
  // Placeholder generator keeps service bootable in live mode.
  while (true) {
    await new Promise((r) => setTimeout(r, 1000));
    const now = new Date().toISOString();
    yield { ts: now, price: 20000 + Math.random() * 10, size: 1 + Math.floor(Math.random() * 5) };
  }
}
