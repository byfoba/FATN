import type { IncomingMessage, ServerResponse } from 'http';
import { ContextPackageSchema } from '../shared/types';
import { verifyHmac } from './_lib/security';
import { storeSnapshot } from './_lib/store';

export default async function handler(req: IncomingMessage & { body?: any; method?: string }, res: ServerResponse & { status: (n: number) => any; json: (v: any) => any }) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const rawBody = JSON.stringify(req.body ?? {});
  if (!verifyHmac(rawBody, req.headers['x-bridge-signature'] as string | undefined, process.env.BRIDGE_SECRET ?? 'dev-bridge-secret')) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  const parsed = ContextPackageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', detail: parsed.error.flatten() });

  await storeSnapshot(parsed.data);
  return res.status(200).json({ accepted: true, analysis_id: parsed.data.snapshot_id });
}
