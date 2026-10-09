import { createHash } from 'node:crypto';
import { peerTracker } from './auth-tracker-request';

export function getAuthAccountTracker(request: Record<string, unknown>): string {
  const body: unknown = request.body;
  const email =
    typeof body === 'object' && body !== null && 'email' in body && typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : null;

  if (!email) return peerTracker(request);

  const digest = createHash('sha256').update(email, 'utf8').digest('hex');
  return `account:${digest}`;
}
