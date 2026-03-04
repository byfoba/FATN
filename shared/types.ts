import { z } from 'zod';

export const AggregatedBarSchema = z.object({
  start_utc: z.string(),
  end_utc: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().int(),
  tick_count: z.number().int(),
});

export const LiquidityPocketSchema = z.object({
  price_range: z.string(),
  side: z.enum(['bid', 'ask', 'both']),
  count: z.number().int(),
});

export const ContextPackageSchema = z.object({
  snapshot_id: z.string().uuid(),
  ticker: z.string(),
  exchange: z.string(),
  exchange_timestamp_utc: z.string(),
  ingestion_timestamp_utc: z.string(),
  last_price: z.number(),
  last_trade_size: z.number().int(),
  aggregated_bars: z.array(AggregatedBarSchema),
  volume_profile_snapshot: z.array(z.record(z.any())),
  liquidity_pockets: z.array(LiquidityPocketSchema),
  recent_structure_events: z.array(z.string()),
  vwap: z.number(),
});

export const AnalyzeInputSchema = z.object({
  snapshot_id: z.string().uuid(),
  user_id: z.string(),
  analysis_window: z.object({
    start_utc: z.string(),
    end_utc: z.string(),
  }),
  preferences: z.record(z.any()).default({}),
});

export const AnalyzeOutputSchema = z.object({
  ticker: z.string(),
  timestamp_utc: z.string(),
  analysis_window: z.object({
    start_utc: z.string(),
    end_utc: z.string(),
  }),
  scenarios: z.array(
    z.object({
      probability_pct: z.number().int(),
      label: z.string(),
      target: z.string(),
      path: z.string(),
      invalidation: z.string(),
    })
  ),
  entry_stops: z.array(
    z.object({
      style: z.string(),
      entry: z.string(),
      stop: z.string(),
    })
  ),
  market_mechanics: z.array(z.string()),
  meta: z.object({
    model: z.literal('gemini-3.0-flash'),
    model_prompt_version: z.string(),
  }),
});

export type ContextPackage = z.infer<typeof ContextPackageSchema>;
export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
export type AnalyzeOutput = z.infer<typeof AnalyzeOutputSchema>;
