import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  ServiceUnavailableException,
  UnauthorizedException,
  UpstreamServiceException,
} from '../../../../common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { Auth0ClientAdapter } from '../../../infrastructure/integrations/auth0-client.adapter';

describe('Auth0ClientAdapter', () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;
  let adapter: Auth0ClientAdapter;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    adapter = new Auth0ClientAdapter(new ConfigService({ AUTH0_DOMAIN: 'tenant.auth0.com' }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should_return_validated_user_info_when_provider_response_is_valid', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: 'google-oauth2|account-1',
          email: 'user@example.com',
          email_verified: true,
          name: 'Test User',
        }),
        { status: 200 },
      ),
    );

    await expect(adapter.getUserInfo('access-token')).resolves.toEqual({
      sub: 'google-oauth2|account-1',
      email: 'user@example.com',
      email_verified: true,
      name: 'Test User',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://tenant.auth0.com/userinfo', {
      headers: { Authorization: 'Bearer access-token' },
      signal: expect.any(AbortSignal),
    });
  });

  it('should_reject_invalid_access_token_without_code_exchange_fallback', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(adapter.getUserInfo('invalid-token')).rejects.toEqual(
      new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should_reject_malformed_provider_payload', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ sub: 'google-oauth2|account-1', email: 42 }), { status: 200 }),
    );

    await expect(adapter.getUserInfo('access-token')).rejects.toEqual(
      new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE),
    );
  });

  it('should_report_provider_5xx_as_unavailable', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(adapter.getUserInfo('access-token')).rejects.toEqual(
      new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE),
    );
  });

  it('should_report_network_failure_as_unavailable', async () => {
    fetchMock.mockRejectedValue(new TypeError('network details must not escape'));

    await expect(adapter.getUserInfo('access-token')).rejects.toEqual(
      new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE),
    );
  });

  it('should_not_log_provider_body_or_network_error_details', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce(
      new Response('TOKEN_SECRET user@example.test', { status: 503 }),
    );
    fetchMock.mockRejectedValueOnce(new Error('DATABASE_URL_SECRET user@example.test'));

    await expect(adapter.getUserInfo('provider-token')).rejects.toEqual(
      new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE),
    );
    await expect(adapter.getUserInfo('provider-token')).rejects.toEqual(
      new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE),
    );

    const logged = JSON.stringify(warn.mock.calls);
    for (const secret of [
      'TOKEN_SECRET',
      'DATABASE_URL_SECRET',
      'user@example.test',
      'provider-token',
    ]) {
      expect(logged).not.toContain(secret);
    }
  });

  it('should_exchange_code_with_fixed_redirect_and_pkce_verifier', async () => {
    adapter = new Auth0ClientAdapter(
      new ConfigService({
        AUTH0_DOMAIN: 'tenant.auth0.com',
        AUTH0_CLIENT_ID: 'client-id',
        AUTH0_CLIENT_SECRET: 'client-secret',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    );
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'provider-token' })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sub: 'google-oauth2|123',
            email: 'user@example.com',
            email_verified: true,
          }),
        ),
      );

    await expect(adapter.exchangeCode('authorization-code', 'verifier')).resolves.toEqual({
      sub: 'google-oauth2|123',
      email: 'user@example.com',
      email_verified: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const tokenRequest = fetchMock.mock.calls[0]?.[1];
    expect(tokenRequest?.body).toBeInstanceOf(URLSearchParams);
    const body = tokenRequest?.body;
    if (!(body instanceof URLSearchParams)) throw new Error('Expected form body');
    expect(body.get('code_verifier')).toBe('verifier');
    expect(body.get('redirect_uri')).toBe('http://localhost:3000/api/auth/oauth/callback');
    expect(body.get('client_secret')).toBe('client-secret');
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://tenant.auth0.com/userinfo');
  });

  it('should_reject_invalid_authorization_code_without_fetching_userinfo', async () => {
    adapter = new Auth0ClientAdapter(
      new ConfigService({
        AUTH0_DOMAIN: 'tenant.auth0.com',
        AUTH0_CLIENT_ID: 'client-id',
        AUTH0_CLIENT_SECRET: 'client-secret',
        FRONTEND_URL: 'http://localhost:3000',
      }),
    );
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(adapter.exchangeCode('invalid-code', 'verifier')).rejects.toEqual(
      new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
