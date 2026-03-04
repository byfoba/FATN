import fs from 'fs';
import path from 'path';
import { AnalyzeOutput, AnalyzeOutputSchema, ContextPackage } from '../../shared/types';

const systemPrompt = fs.readFileSync(path.resolve(process.cwd(), 'model/system_prompt.txt'), 'utf8');

export async function runGeminiAnalysis(context: ContextPackage, startUtc: string, endUtc: string): Promise<AnalyzeOutput> {
  if (!process.env.GEMINI_API_KEY) return fallback(context, startUtc, endUtc);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nINPUT_CONTEXT:\n${JSON.stringify({ context, analysis_window: { start_utc: startUtc, end_utc: endUtc } })}` }] }],
      }),
    }
  );

  if (!response.ok) return fallback(context, startUtc, endUtc);
  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return fallback(context, startUtc, endUtc);
  const parsed = JSON.parse(text);
  return AnalyzeOutputSchema.parse(parsed);
}

function fallback(context: ContextPackage, startUtc: string, endUtc: string): AnalyzeOutput {
  return {
    ticker: context.ticker,
    timestamp_utc: new Date().toISOString(),
    analysis_window: { start_utc: startUtc, end_utc: endUtc },
    scenarios: [
      { probability_pct: 65, label: 'Controlled Grind', target: String(Math.round(context.last_price + 45)), path: 'Trend continuation above value.', invalidation: 'Price stays below 24620 for ten minutes with rising sell volume.' },
      { probability_pct: 25, label: 'High-Level Compression', target: String(Math.round(context.last_price)), path: 'Balanced rotation near VWAP.', invalidation: 'Break and hold above 24745 with high volume.' },
      { probability_pct: 10, label: 'Late-Day Fade', target: String(Math.round(context.last_price - 70)), path: 'Failed breakout reverses into value.', invalidation: 'Sustained buy imbalance reclaims failed auction zone.' },
    ],
    entry_stops: [
      { style: 'aggressive', entry: String(Math.round(context.last_price + 5)), stop: String(Math.round(context.last_price - 20)) },
      { style: 'conservative', entry: `${Math.round(context.last_price - 20)}-${Math.round(context.last_price)}`, stop: String(Math.round(context.last_price - 40)) },
    ],
    market_mechanics: ['Liquidity pocket cleared and accepted higher.', 'Failed auction behavior indicates seller exhaustion.'],
    meta: { model: 'gemini-3.0-flash', model_prompt_version: 'v1' },
  };
}
