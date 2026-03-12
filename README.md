# Real-Time Futures Market Bias & Scenario Analyzer (MVP)

Private MVP for two users to analyze CME futures session bias using live data from NinjaTrader CME Level 1 and Gemini 3.0 Flash.

> **INTERNAL USE ONLY — DO NOT REDISTRIBUTE MARKET DATA**

## Architecture

- **frontend/**: Next.js UI (dashboard, analysis, settings) with timezone detection and profile save.
- **api/**: Vercel serverless endpoints.
- **bridge/**: VPS Node.js bridge (live or playback), tick dedupe, 1s bars, replay buffer, metrics.
- **infra/**: Supabase schema, env templates, VPS scripts, alert examples.
- **model/**: Prompt templates and I/O examples.
- **tests/**: Unit and integration tests including playback fixtures.

## Exact API Contracts

### POST `/api/context`
- Auth header: `x-bridge-signature: HMAC_SHA256(payload, BRIDGE_SECRET)`
- Payload fields:
  - `snapshot_id`, `ticker`, `exchange`, `exchange_timestamp_utc`, `ingestion_timestamp_utc`
  - `last_price`, `last_trade_size`, `aggregated_bars`, `volume_profile_snapshot`, `liquidity_pockets`, `recent_structure_events`, `vwap`
- Response: `200 {"accepted": true, "analysis_id": "..."}`
- Action: persists snapshot and prepares analysis trigger.

### POST `/api/analyze`
- Internal signed auth: `x-bridge-signature: HMAC_SHA256(payload, INTERNAL_API_SECRET)`
- Input:
```json
{"snapshot_id":"","user_id":"","analysis_window":{"start_utc":"","end_utc":""},"preferences":{}}
```
- Action: builds prompt, calls Gemini, validates JSON schema, persists analyses.
- Output schema: see `shared/types.ts` and `model/example_response.json`.

### GET `/api/status`
- Health and basic runtime metadata.

### POST `/api/admin/rerun`
- Internal endpoint to force replay for `snapshot_id`.

## Supabase Setup

1. Create project and capture URL + keys.
2. Run SQL in `infra/supabase_schema.sql`.
3. Ensure tables exist: `users`, `snapshots`, `analyses`, `analysis_queue`.

## NinjaTrader CME Level 1 / VPS Setup

1. Activate **NinjaTrader CME Level 1** market data subscription in your NinjaTrader account.
2. Provision VPS (Ubuntu or Windows).
3. Run NinjaTrader data feed/connector process on the VPS.
4. On Ubuntu, run:
   ```bash
   ./infra/vps_setup_ubuntu.sh
   ```
5. Deploy bridge service with env vars from `infra/env.example`.

## Environment Variables
Copy `infra/env.example` into deployment environments:
- Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_API_SECRET`, `BRIDGE_SECRET`, `GEMINI_API_KEY`
- Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Bridge: `API_BASE_URL`, `TICKER`, `EXCHANGE`, `ANALYSIS_CADENCE_SEC`

## Run Locally

```bash
npm ci
npm run test
npm run dev:frontend
```

Bridge playback mode:
```bash
npm run bridge:playback
```

Bridge live mode (stub with NinjaTrader adapter hooks):
```bash
npm run bridge:live
```

## Cost Control & Monitoring
- Tick batching: 1-second aggregation.
- Model cadence default: 15 seconds (`ANALYSIS_CADENCE_SEC=15`).
- Event triggers: volume spike (`size >= 10`) forces immediate context push.
- Bridge metrics: `tick_rate`, `ingestion_latency_ms`, `reconnect_count` at `/metrics`.
- Alert examples in `infra/alerts.example.yml`.

## Security Checklist
- Use HMAC signatures for bridge/serverless communication.
- Keep secrets in Vercel env and secured VPS env files.
- Restrict SSH with keys + IP allow-list.
- Enable VPS firewall (`ufw`) and only open required ports.

## Timezone Behavior
- Store all timestamps in UTC.
- UI detects browser timezone and allows saving to Supabase profile (`users.timezone`).
- Display localized timestamps in frontend views.

## Gemini Prompting
- System prompt: `model/system_prompt.txt` (strict JSON-only response rules).
- Example context/output: `model/example_context.json`, `model/example_response.json`.

## Optional Data Provider Swap (Polygon.io)
- Add a new bridge adapter module under `bridge/src/adapters/`.
- Keep output contract identical to `ContextPackageSchema`.
- Keep redistribution disabled.

## TODO (Human Required)
- Insert real Gemini API key and verify pricing/budget limits.
- Implement full NinjaTrader API/feed integration in `liveNinjaTraderAdapter.ts`.
- Configure Supabase auth and replace `demo-user` in frontend.
- Configure Slack/PagerDuty webhook in alert pipeline.

## Deployment Checklist
1. Configure Supabase schema.
2. Deploy Vercel project with env vars.
3. Start bridge on VPS (systemd recommended).
4. Validate `/api/status`, bridge `/health`, and bridge `/metrics`.
5. Run playback test in CI and manual smoke test with `/api/context` -> `/api/analyze`.
