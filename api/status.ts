import type { IncomingMessage, ServerResponse } from 'http';

const startedAt = Date.now();

export default async function handler(_req: IncomingMessage, res: ServerResponse & { status: (n: number) => any; json: (v: any) => any }) {
  return res.status(200).json({
    ok: true,
    uptime_s: Math.floor((Date.now() - startedAt) / 1000),
    model: 'gemini-3.0-flash',
  });
}
