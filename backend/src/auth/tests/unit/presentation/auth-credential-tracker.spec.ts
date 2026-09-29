import {
  getAuthCredentialTracker,
  getRefreshCredentialTracker,
} from '../../../presentation/throttling/auth-credential-tracker';

describe('Auth credential throttle tracker', () => {
  it('should_use_stable_digest_without_exposing_raw_credential', () => {
    const request = (token: string) => ({
      body: { token },
      socket: { remoteAddress: '127.0.0.1' },
    });

    const first = getAuthCredentialTracker(request('RAW_TOKEN_SECRET'));
    const same = getAuthCredentialTracker(request('RAW_TOKEN_SECRET'));
    const other = getAuthCredentialTracker(request('OTHER_TOKEN_SECRET'));

    expect(first).toBe(same);
    expect(first).not.toBe(other);
    expect(first).not.toContain('RAW_TOKEN_SECRET');
  });
  it('should_hash_cookie_refresh_credential_and_prefer_body_when_present', () => {
    const request = (body: unknown, cookie: string) => ({
      body,
      cookies: { refresh_token: cookie },
      socket: { remoteAddress: '127.0.0.1' },
    });

    const cookie = getRefreshCredentialTracker(request({}, 'COOKIE_SECRET'));
    const sameCookie = getRefreshCredentialTracker(request({}, 'COOKIE_SECRET'));
    const body = getRefreshCredentialTracker(request({ token: 'BODY_SECRET' }, 'COOKIE_SECRET'));

    expect(cookie).toBe(sameCookie);
    expect(body).not.toBe(cookie);
    expect(cookie).not.toContain('COOKIE_SECRET');
    expect(body).not.toContain('BODY_SECRET');
  });
});
