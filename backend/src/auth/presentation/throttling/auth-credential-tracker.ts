import { createHash } from 'node:crypto';
import { peerTracker } from './auth-tracker-request';
import { AUTH_COOKIE_NAMES } from '../../domain/constants/auth.constants';

function trackerForCredential(request: Record<string, unknown>, credential: unknown): string {
  if (typeof credential !== 'string' || !credential) {
    return peerTracker(request);
  }

  const digest = createHash('sha256').update(credential, 'utf8').digest('hex');
  return `credential:${digest}`;
}

export function getAuthCredentialTracker(request: Record<string, unknown>): string {
  const body: unknown = request.body;
  if (typeof body !== 'object' || body === null) {
    return trackerForCredential(request, null);
  }

  if ('token' in body) return trackerForCredential(request, body.token);
  if ('code' in body) return trackerForCredential(request, body.code);
  return trackerForCredential(request, null);
}

export function getRefreshCredentialTracker(request: Record<string, unknown>): string {
  const body: unknown = request.body;
  if (typeof body === 'object' && body !== null) {
    if ('token' in body) return trackerForCredential(request, body.token);
    if ('refreshToken' in body) return trackerForCredential(request, body.refreshToken);
  }

  const cookies: unknown = request.cookies;
  const cookieCredential =
    typeof cookies === 'object' && cookies !== null && AUTH_COOKIE_NAMES.REFRESH_TOKEN in cookies
      ? cookies[AUTH_COOKIE_NAMES.REFRESH_TOKEN]
      : undefined;
  return trackerForCredential(request, cookieCredential);
}
