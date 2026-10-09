import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { CsrfOriginGuard } from './csrf-origin.guard';

@Controller('csrf-test')
class CsrfTestController {
  @Post()
  mutate() {
    return { ok: true };
  }

  @Get()
  read() {
    return { ok: true };
  }
}

describe('CSRF origin guard HTTP', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CsrfTestController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalGuards(
      new CsrfOriginGuard(new ConfigService({ cors: { origins: ['http://localhost:3000'] } })),
    );
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const mutate = (headers: Record<string, string>) =>
    fetch(`${url}/csrf-test`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(5000),
    });

  it.each([
    {
      origin: 'http://sibling.localhost:3000',
      'sec-fetch-site': 'same-site',
      cookie: 'access_token=x',
    },
    { origin: 'null', 'sec-fetch-site': 'cross-site', cookie: 'access_token=x' },
    { cookie: 'access_token=x' },
    { origin: 'http://sibling.localhost:3000', 'content-type': 'multipart/form-data' },
    { 'sec-fetch-site': 'cross-site' },
  ])('should_reject_untrusted_cookie_mutation_%j', async (headers) => {
    expect((await mutate(headers)).status).toBe(403);
  });

  it('should_allow_trusted_frontend_origin_with_cookie', async () => {
    const response = await mutate({
      origin: 'http://localhost:3000',
      'sec-fetch-site': 'same-site',
      cookie: 'access_token=x',
    });

    expect(response.status).toBe(201);
  });

  it('should_allow_server_to_server_bearer_request_without_browser_headers', async () => {
    const response = await mutate({ authorization: 'Bearer token' });

    expect(response.status).toBe(201);
  });

  it('should_allow_read_requests_without_origin', async () => {
    const response = await fetch(`${url}/csrf-test`, {
      headers: { cookie: 'access_token=x' },
    });

    expect(response.status).toBe(200);
  });
});
