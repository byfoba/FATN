import { Tick } from './types';

export class ReplayBuffer {
  constructor(private readonly maxMs: number, private readonly ticks: Tick[] = []) {}

  push(tick: Tick) {
    this.ticks.push(tick);
    const cutoff = new Date(tick.ts).getTime() - this.maxMs;
    while (this.ticks.length > 0 && new Date(this.ticks[0].ts).getTime() < cutoff) {
      this.ticks.shift();
    }
  }

  getAll(): Tick[] {
    return [...this.ticks];
  }
}
