import crypto from 'crypto';

export async function postContext(apiBaseUrl: string, payload: unknown, secret: string) {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const response = await fetch(`${apiBaseUrl}/api/context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bridge-signature': signature,
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`Context post failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}
