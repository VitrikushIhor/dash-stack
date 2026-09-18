import { SetCardStarUseCase } from '../../../application/use-cases/set-card-star.use-case';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../../auth/presentation/guards/jwt-auth.guard';
import { GetDueReviewsUseCase } from '../../../application/use-cases/get-due-reviews.use-case';
import { ToggleCardStarUseCase } from '../../../application/use-cases/toggle-card-star.use-case';
import { VocabProgressController } from '../../../presentation/controllers/vocab-progress.controller';

describe('Star endpoint throttling', () => {
  let app: INestApplication;
  let url: string;
  const execute = jest.fn().mockResolvedValue({ flashcardId: 'card-1', isStarred: true });

  beforeEach(async () => {
    execute.mockClear();
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
      controllers: [VocabProgressController],
      providers: [
        { provide: GetDueReviewsUseCase, useValue: { execute: jest.fn() } },
        { provide: ToggleCardStarUseCase, useValue: { execute } },
        { provide: SetCardStarUseCase, useValue: { execute } },
      ],
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it.each([true, false])('should_accept_explicit_boolean_%s', async (isStarred) => {
    const response = await fetch(`${url}/v1/vocab/cards/card-1/star`, {
      method: 'PUT',
      headers: { 'x-test-user': 'user-1', 'content-type': 'application/json' },
      body: JSON.stringify({ isStarred }),
    });

    expect(response.status).toBe(200);
    await response.text();
  });

  it.each([{}, { isStarred: 'false' }, { isStarred: 0 }, { isStarred: null }])(
    'should_reject_invalid_star_body_%j',
    async (body) => {
      const response = await fetch(`${url}/v1/vocab/cards/card-1/star`, {
        method: 'PUT',
        headers: { 'x-test-user': 'user-1', 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      expect(response.status).toBe(400);
      await response.text();
    },
  );

  it.each(['POST', 'PUT'])('should_limit_each_user_across_cards_for_%s', async (method) => {
    for (let index = 0; index < 30; index += 1) {
      const response = await fetch(`${url}/v1/vocab/cards/card-${index}/star`, {
        method,
        headers: { 'x-test-user': 'user-1', 'content-type': 'application/json' },
        body: JSON.stringify({ isStarred: true }),
      });

      expect(response.status).toBe(200);
      await response.text();
    }
    const blocked = await fetch(`${url}/v1/vocab/cards/card-31/star`, {
      method,
      headers: { 'x-test-user': 'user-1', 'content-type': 'application/json' },
      body: JSON.stringify({ isStarred: true }),
    });

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    await blocked.text();
    expect(execute).toHaveBeenCalledTimes(30);
    const otherUser = await fetch(`${url}/v1/vocab/cards/card-1/star`, {
      method,
      headers: { 'x-test-user': 'user-2', 'content-type': 'application/json' },
      body: JSON.stringify({ isStarred: true }),
    });

    expect(otherUser.status).toBe(200);
    await otherUser.text();
  });

  it.each(['POST', 'PUT'])('should_reject_unauthenticated_%s_before_mutation', async (method) => {
    const response = await fetch(`${url}/v1/vocab/cards/card-1/star`, { method });

    expect(response.status).toBe(401);
    await response.text();
    expect(execute).not.toHaveBeenCalled();
  });
});
