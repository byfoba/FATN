import type { IncomingMessage, ServerResponse } from 'http';
import { AnalyzeInputSchema } from '../shared/types';
import { verifyHmac } from './_lib/security';
import { getSnapshot, storeAnalysis } from './_lib/store';
import { runGeminiAnalysis } from './_lib/model';

export default async function handler(req: IncomingMessage & { body?: any; method?: string }, res: ServerResponse & { status: (n: number) => any; json: (v: any) => any }) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const rawBody = JSON.stringify(req.body ?? {});
  if (!verifyHmac(rawBody, req.headers['x-bridge-signature'] as string | undefined, process.env.INTERNAL_API_SECRET ?? 'dev-internal-secret')) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  const parsed = AnalyzeInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', detail: parsed.error.flatten() });

  const context = await getSnapshot(parsed.data.snapshot_id);
  if (!context) return res.status(404).json({ error: 'snapshot_not_found' });

  const result = await runGeminiAnalysis(context, parsed.data.analysis_window.start_utc, parsed.data.analysis_window.end_utc);
  await storeAnalysis(parsed.data.user_id, context, result);
  return res.status(200).json(result);
}
