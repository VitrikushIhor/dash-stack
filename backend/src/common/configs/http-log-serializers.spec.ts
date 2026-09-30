import { Writable } from 'node:stream';
import pinoHttp from 'pino-http';
import {
  createHttpRequestId,
  serializeHttpRequest,
  serializeHttpResponse,
} from './http-log-serializers';

describe('HTTP log serializers', () => {
  it('should_accept_only_canonical_correlation_ids_and_generate_new_ids_otherwise', () => {
    const trusted = '8dbecb6d-2b38-45f0-aece-071554d93a9e';
    expect(createHttpRequestId({ headers: { 'x-request-id': trusted } })).toBe(trusted);
    expect(
      createHttpRequestId({ headers: { 'x-request-id': 'EMAIL_SECRET@example.com' } }),
    ).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should_log_request_metadata_without_credentials_or_query_values', () => {
    const entries: string[] = [];
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        entries.push(chunk.toString());
        callback();
      },
    });
    const logger = pinoHttp(
      {
        autoLogging: false,
        serializers: { req: serializeHttpRequest, res: serializeHttpResponse },
      },
      stream,
    );

    logger.logger.info({
      req: {
        id: 'request-123',
        method: 'POST',
        url: '/api/auth/verify-email?token=QUERY_SECRET',
        headers: { cookie: 'refresh_token=COOKIE_SECRET', authorization: 'Bearer BEARER_SECRET' },
        query: { token: 'QUERY_SECRET' },
        body: { token: 'BODY_SECRET', email: 'person@example.com' },
      },
      res: {
        headersSent: true,
        statusCode: 401,
        getHeaders: () => ({ 'set-cookie': 'refresh_token=RESPONSE_SECRET' }),
      },
    });

    const logged = entries.join('');
    expect(logged).toContain('request-123');
    expect(logged).toContain('/api/auth/verify-email');
    expect(logged).toContain('"statusCode":401');
    for (const secret of [
      'QUERY_SECRET',
      'COOKIE_SECRET',
      'BEARER_SECRET',
      'BODY_SECRET',
      'RESPONSE_SECRET',
      'person@example.com',
    ]) {
      expect(logged).not.toContain(secret);
    }
  });
});
