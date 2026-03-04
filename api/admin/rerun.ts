import type { IncomingMessage, ServerResponse } from 'http';
import { verifyHmac } from '../_lib/security';

export default async function handler(req: IncomingMessage & { body?: any; method?: string }, res: ServerResponse & { status: (n: number) => any; json: (v: any) => any }) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const rawBody = JSON.stringify(req.body ?? {});
  if (!verifyHmac(rawBody, req.headers['x-bridge-signature'] as string | undefined, process.env.INTERNAL_API_SECRET ?? 'dev-internal-secret')) {
    return res.status(401).json({ error: 'invalid_signature' });
  }
  const snapshotId = req.body?.snapshot_id;
  if (!snapshotId) return res.status(400).json({ error: 'snapshot_id_required' });
  return res.status(200).json({ accepted: true, snapshot_id: snapshotId, note: 'Trigger analyze pipeline by posting to /api/analyze' });
}
