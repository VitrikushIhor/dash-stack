import { ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../auth/presentation/guards/jwt-auth.guard';
import { SearchUnsplashPhotosUseCase } from '../../../application/use-cases/search-unsplash-photos.use-case';
import { UnsplashController } from '../../../presentation/controllers/unsplash.controller';

describe('Unsplash endpoint throttling', () => {
  let app: INestApplication;
  let url: string;
  const execute = jest
    .fn<Promise<{ results: never[]; total: number; totalPages: number }>, [unknown]>()
    .mockResolvedValue({ results: [], total: 0, totalPages: 0 });

  beforeEach(async () => {
    execute.mockClear();
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
      controllers: [UnsplashController],
      providers: [{ provide: SearchUnsplashPhotosUseCase, useValue: { execute } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>;
            user?: { id: string };
          }>();
          const id = request.headers['x-test-user'];
          if (!id) throw new UnauthorizedException();
          request.user = { id };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should_limit_each_user_across_queries_without_blocking_another_user', async () => {
    for (let index = 0; index < 30; index += 1) {
      const response = await fetch(`${url}/v1/vocab/unsplash/search?q=cat-${index}`, {
        method: 'GET',
        headers: { 'x-test-user': 'user-1' },
      });
      expect(response.status).toBe(200);
      await response.text();
    }
    const blocked = await fetch(`${url}/v1/vocab/unsplash/search?q=dog`, {
      method: 'GET',
      headers: { 'x-test-user': 'user-1' },
    });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(Number(blocked.headers.get('retry-after'))).toBeLessThanOrEqual(60);
    await blocked.text();
    expect(execute).toHaveBeenCalledTimes(30);
    const otherUser = await fetch(`${url}/v1/vocab/unsplash/search?q=cat`, {
      method: 'GET',
      headers: { 'x-test-user': 'user-2' },
    });
    expect(otherUser.status).toBe(200);
    await otherUser.text();
  });

  it('should_reject_an_unauthenticated_request_before_mutation', async () => {
    const response = await fetch(`${url}/v1/vocab/unsplash/search?q=cat`, { method: 'GET' });
    expect(response.status).toBe(401);
    await response.text();
    expect(execute).not.toHaveBeenCalled();
    expect(response.headers.get('retry-after')).toBeNull();
  });
});
