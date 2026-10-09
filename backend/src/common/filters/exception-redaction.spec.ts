import { Controller, Get, HttpException, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BadRequestException as DomainBadRequestException } from '../exceptions/domain.exception';
import { DomainExceptionFilter } from './domain-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('redaction-test')
class RedactionTestController {
  @Get('http')
  http(): never {
    throw new HttpException({ message: 'SENSITIVE_TOKEN' }, 400);
  }

  @Get('domain')
  domain(): never {
    throw new DomainBadRequestException('SENSITIVE_TOKEN');
  }
}

describe('Exception filter redaction HTTP', () => {
  let app: INestApplication;
  let origin: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [RedactionTestController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalFilters(new DomainExceptionFilter(), new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => app.close());

  it.each(['http', 'domain'])(
    'should_omit_credentials_from_%s_exception_log_and_response_path',
    async (kind) => {
      const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      const response = await fetch(`${origin}/redaction-test/${kind}?token=QUERY_SECRET`);
      const body: unknown = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual(expect.objectContaining({ path: `/redaction-test/${kind}` }));
      const logged = logger.mock.calls.flat().map(String).join(' ');
      expect(logged).not.toContain('SENSITIVE_TOKEN');
      expect(logged).not.toContain('QUERY_SECRET');
      expect(logged).toContain('400');
    },
  );
});
