import { INestApplication } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { z } from 'zod';

@Resolver()
class DependencyProbeResolver {
  @Query(() => String)
  dependencyProbe(): string {
    return 'ready';
  }
}

describe('Learning GraphQL dependency compatibility', () => {
  let app: INestApplication;
  let origin: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          playground: false,
          introspection: false,
          csrfPrevention: true,
        }),
      ],
      providers: [DependencyProbeResolver],
    }).compile();
    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should_execute_a_typed_query_when_nest_apollo_and_express_are_combined', async () => {
    const response = await fetch(`${origin}/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ dependencyProbe }' }),
      signal: AbortSignal.timeout(5_000),
    });
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(
      z.object({ data: z.object({ dependencyProbe: z.literal('ready') }) }).parse(payload),
    ).toEqual({
      data: { dependencyProbe: 'ready' },
    });
  });

  it('should_reject_a_simple_request_when_csrf_prevention_is_enabled', async () => {
    const response = await fetch(`${origin}/graphql?query=%7BdependencyProbe%7D`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(response.status).toBe(400);
    const payload: unknown = await response.json();
    const errors = z.object({ errors: z.array(z.object({ message: z.string() })) }).parse(payload);
    expect(errors.errors.some((error) => error.message.includes('CSRF'))).toBe(true);
  });
});
