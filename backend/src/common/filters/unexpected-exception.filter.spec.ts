import { BadRequestException, Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Writable } from 'node:stream';
import { Logger, LoggerModule } from 'nestjs-pino';
import {
  createHttpRequestId,
  serializeHttpRequest,
  serializeHttpResponse,
} from '../configs/http-log-serializers';
import { UnexpectedExceptionFilter } from './unexpected-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('error-probe')
class ErrorProbeController {
  @Get('bad-request')
  badRequest(): never {
    throw new BadRequestException('Expected bad request');
  }

  @Get('type-error')
  typeError(): never {
    throw new TypeError('SECRET_PRIVATE_FIELD');
  }

  @Get()
  fail(): never {
    throw new Error('DATABASE_URL_SECRET password=BODY_SECRET');
  }
}

describe('Unexpected HTTP exception boundary', () => {
  let app: INestApplication;
  let origin: string;
  const entries: string[] = [];

  beforeAll(async () => {
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        entries.push(chunk.toString());
        callback();
      },
    });
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            autoLogging: true,
            genReqId: createHttpRequestId,
            serializers: { req: serializeHttpRequest, res: serializeHttpResponse },
            stream,
          },
        }),
      ],
      controllers: [ErrorProbeController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useLogger(app.get(Logger));
    app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => app.close());

  it('should_preserve_expected_http_exception_status', async () => {
    const response = await fetch(`${origin}/error-probe/bad-request`);
    expect(response.status).toBe(400);
  });

  it('should_return_generic_500_and_omit_raw_error_and_credentials_from_logs', async () => {
    entries.length = 0;
    const response = await fetch(`${origin}/error-probe?token=QUERY_SECRET`, {
      headers: { cookie: 'refresh_token=COOKIE_SECRET' },
    });

    expect(response.status).toBe(500);
    const body: unknown = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 500,
        path: '/error-probe',
        message: 'Internal server error',
      }),
    );
    const logged = entries.join('');
    expect(logged).toContain('Unhandled HTTP request failed');
    expect(logged).toContain('unexpected_error');
    expect(logged).toContain('/error-probe');
    for (const secret of ['DATABASE_URL_SECRET', 'BODY_SECRET', 'QUERY_SECRET', 'COOKIE_SECRET']) {
      expect(logged).not.toContain(secret);
    }
  });
  it('should_log_safe_failure_category_with_request_correlation_without_raw_exception', async () => {
    entries.length = 0;
    const requestId = 'f0e6fdf4-b075-4b1a-8178-563512267f62';
    const response = await fetch(`${origin}/error-probe/type-error`, {
      headers: { 'x-request-id': requestId },
    });
    expect(response.status).toBe(500);
    const logged = entries.join('');
    expect(logged).toContain('type_error');
    expect(logged).toContain(requestId);
    expect(logged).not.toContain('SECRET_PRIVATE_FIELD');
  });
});
