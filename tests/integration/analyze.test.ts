import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import contextHandler from '../../api/context';
import analyzeHandler from '../../api/analyze';

function createRes() {
  const state: any = { statusCode: 200, jsonBody: null };
  state.status = (code: number) => {
    state.statusCode = code;
    return state;
  };
  state.json = (body: unknown) => {
    state.jsonBody = body;
    return state;
  };
  return state;
}

describe('api analyze pipeline', () => {
  it('accepts context and returns schema-compliant analysis', async () => {
    const contextBody = {
      snapshot_id: '6dd0f0ad-f007-4e35-95ca-28f24aef6c90',
      ticker: 'NQ',
      exchange: 'CME',
      exchange_timestamp_utc: '2026-03-04T12:53:00Z',
      ingestion_timestamp_utc: '2026-03-04T12:53:01Z',
      last_price: 24740,
      last_trade_size: 2,
      aggregated_bars: [],
      volume_profile_snapshot: [],
      liquidity_pockets: [],
      recent_structure_events: [],
      vwap: 24720,
    };
    const contextRaw = JSON.stringify(contextBody);
    const contextSig = crypto.createHmac('sha256', 'dev-bridge-secret').update(contextRaw).digest('hex');
    const contextReq: any = { method: 'POST', headers: { 'x-bridge-signature': contextSig }, body: contextBody };
    const contextRes = createRes();
    await contextHandler(contextReq, contextRes);
    expect(contextRes.statusCode).toBe(200);

    const analyzeBody = {
      snapshot_id: contextBody.snapshot_id,
      user_id: 'demo-user',
      analysis_window: { start_utc: '2026-03-04T11:23:00Z', end_utc: '2026-03-04T12:53:00Z' },
      preferences: {},
    };
    const analyzeRaw = JSON.stringify(analyzeBody);
    const analyzeSig = crypto.createHmac('sha256', 'dev-internal-secret').update(analyzeRaw).digest('hex');
    const analyzeReq: any = { method: 'POST', headers: { 'x-bridge-signature': analyzeSig }, body: analyzeBody };
    const analyzeRes = createRes();
    await analyzeHandler(analyzeReq, analyzeRes);

    expect(analyzeRes.statusCode).toBe(200);
    expect(analyzeRes.jsonBody.ticker).toBe('NQ');
    expect(Array.isArray(analyzeRes.jsonBody.scenarios)).toBe(true);
    expect(Array.isArray(analyzeRes.jsonBody.entry_stops)).toBe(true);
    expect(analyzeRes.jsonBody.meta.model).toBe('gemini-3.0-flash');
  });
});
