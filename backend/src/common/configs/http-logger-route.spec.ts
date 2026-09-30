import { Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Writable } from 'node:stream';
import { LoggerModule } from 'nestjs-pino';
import {
  createHttpRequestId,
  serializeHttpRequest,
  serializeHttpResponse,
} from './http-log-serializers';

@Controller('auth')
class LoggedAuthController {
  @Post('log-probe')
  probe(): { ok: true } {
    return { ok: true };
  }
}

describe('HTTP logger route coverage', () => {
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
      controllers: [LoggedAuthController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => app.close());

  it('should_log_auth_request_when_global_prefix_is_configured', async () => {
    const response = await fetch(`${origin}/api/auth/log-probe?token=QUERY_SECRET`, {
      method: 'POST',
      headers: {
        cookie: 'refresh_token=COOKIE_SECRET',
        'x-request-id': '8dbecb6d-2b38-45f0-aece-071554d93a9e',
      },
    });

    expect(response.status).toBe(201);
    const logged = entries.join('');
    expect(logged).toContain('/api/auth/log-probe');
    expect(logged).toContain('8dbecb6d-2b38-45f0-aece-071554d93a9e');
    expect(logged).not.toContain('QUERY_SECRET');
    expect(logged).not.toContain('COOKIE_SECRET');
  });
});
