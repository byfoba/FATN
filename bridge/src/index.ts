import express from 'express';
import client from 'prom-client';
import { aggregate1s, createSnapshotId, dedupeTicks } from './core/aggregator';
import { loadTicksFromCsv } from './adapters/playbackAdapter';
import { liveNinjaTraderTicks } from './adapters/liveNinjaTraderAdapter';
import { postContext } from './core/publisher';
import { BridgeConfig, Tick } from './core/types';
import { ReplayBuffer } from './core/replayBuffer';

function parseArgs(): BridgeConfig {
  const args = process.argv.slice(2);
  const mode = (args.includes('--mode') ? args[args.indexOf('--mode') + 1] : 'playback') as 'live' | 'playback';
  return {
    mode,
    csvPath: args.includes('--csv') ? args[args.indexOf('--csv') + 1] : undefined,
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000',
    ticker: process.env.TICKER ?? 'NQ',
    exchange: process.env.EXCHANGE ?? 'CME',
    bridgeSecret: process.env.BRIDGE_SECRET ?? 'dev-bridge-secret',
    analysisCadenceSec: Number(process.env.ANALYSIS_CADENCE_SEC ?? 15),
  };
}

const tickRate = new client.Gauge({ name: 'tick_rate', help: 'Ticks processed per cycle' });
const ingestionLatency = new client.Gauge({ name: 'ingestion_latency_ms', help: 'Tick to context push latency' });
const reconnectCount = new client.Counter({ name: 'reconnect_count', help: 'Number of reconnect attempts' });

async function run() {
  const config = parseArgs();
  const replay = new ReplayBuffer(60 * 60 * 1000);
  const app = express();

  app.get('/health', (_req, res) => res.json({ ok: true, mode: config.mode }));
  app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
  });
  app.listen(Number(process.env.BRIDGE_PORT ?? 9464));

  const ticks: Tick[] = config.mode === 'playback'
    ? loadTicksFromCsv(config.csvPath ?? 'tests/fixtures/sample_ticks.csv')
    : [];

  let lastPush = 0;
  const processBatch = async (batch: Tick[]) => {
    const deduped = dedupeTicks(batch);
    tickRate.set(deduped.length);
    for (const tick of deduped) replay.push(tick);

    const now = Date.now();
    const trigger = deduped.some((t) => t.size >= 10);
    if (now - lastPush < config.analysisCadenceSec * 1000 && !trigger) return;

    const bars = aggregate1s(replay.getAll().slice(-300));
    const last = deduped[deduped.length - 1];
    const payload = {
      snapshot_id: createSnapshotId(),
      ticker: config.ticker,
      exchange: config.exchange,
      exchange_timestamp_utc: last.ts,
      ingestion_timestamp_utc: new Date().toISOString(),
      last_price: last.price,
      last_trade_size: last.size,
      aggregated_bars: bars,
      volume_profile_snapshot: [],
      liquidity_pockets: [],
      recent_structure_events: trigger ? ['volume_spike'] : [],
      vwap: bars.length ? bars.reduce((a, b) => a + b.close, 0) / bars.length : last.price,
    };

    await postContext(config.apiBaseUrl, payload, config.bridgeSecret);
    ingestionLatency.set(Date.now() - new Date(last.ts).getTime());
    lastPush = now;
  };

  if (config.mode === 'playback') {
    for (let i = 0; i < ticks.length; i += 20) {
      await processBatch(ticks.slice(i, i + 20));
    }
    return;
  }

  while (true) {
    try {
      const batch: Tick[] = [];
      for await (const tick of liveNinjaTraderTicks()) {
        batch.push(tick);
        if (batch.length >= 20) {
          await processBatch([...batch]);
          batch.length = 0;
        }
      }
    } catch {
      reconnectCount.inc();
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
