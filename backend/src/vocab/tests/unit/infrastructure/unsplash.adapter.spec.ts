import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageSearchUnavailableException } from '../../../application/exceptions/image-search.exceptions';
import { UnsplashAdapter } from '../../../infrastructure/integrations/unsplash.adapter';

const validPayload = {
  results: [
    {
      id: 'photo-1',
      urls: {
        thumb: 'https://images.unsplash.com/thumb',
        regular: 'https://images.unsplash.com/regular',
      },
      user: { name: 'Photographer', links: { html: 'https://unsplash.com/@person' } },
    },
  ],
  total: 1,
  total_pages: 1,
};

describe('UnsplashAdapter', () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  const createAdapter = (environment = 'production', accessKey = 'test-key') =>
    new UnsplashAdapter(
      new ConfigService({ NODE_ENV: environment, UNSPLASH_ACCESS_KEY: accessKey }),
    );

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(['production', 'development'])(
    'should_surface_stable_failure_when_provider_returns_429_in_%s',
    async (environment) => {
      fetchMock.mockResolvedValue(
        new Response('private provider details', {
          status: 429,
          statusText: 'Provider quota detail',
        }),
      );
      await expect(createAdapter(environment).searchPhotos('cat')).rejects.toEqual(
        new ImageSearchUnavailableException(),
      );
    },
  );

  it.each(['production', 'development'])(
    'should_surface_stable_failure_when_network_fails_in_%s',
    async (environment) => {
      fetchMock.mockRejectedValue(new Error('private network details'));
      await expect(createAdapter(environment).searchPhotos('cat')).rejects.toEqual(
        new ImageSearchUnavailableException(),
      );
    },
  );

  it.each([
    null,
    { results: {} },
    { results: [{ id: 12 }] },
    { results: [{ id: 'photo', urls: { thumb: 12 } }], total: 1, total_pages: 1 },
    { results: [{ id: 'photo', user: { name: {} } }], total: 1, total_pages: 1 },
    { results: [], total: 'invalid', total_pages: 1 },
    { results: [], total: -1, total_pages: 1 },
  ])('should_reject_malformed_payload_when_provider_returns_%j', async (payload: unknown) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(payload)));
    await expect(createAdapter().searchPhotos('cat')).rejects.toEqual(
      new ImageSearchUnavailableException(),
    );
  });

  it('should_reject_invalid_json_when_provider_returns_success', async () => {
    fetchMock.mockResolvedValue(new Response('{broken'));
    await expect(createAdapter().searchPhotos('cat')).rejects.toEqual(
      new ImageSearchUnavailableException(),
    );
  });

  it('should_cache_success_when_normalized_query_and_pagination_match', async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(validPayload)));
    const adapter = createAdapter();
    const first = await adapter.searchPhotos(' CAT ', 1, 12);
    expect(await adapter.searchPhotos('cat', 1, 12)).toEqual(first);
    expect(first.results[0]).toMatchObject({ id: 'photo-1', photographerName: 'Photographer' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await adapter.searchPhotos('cat', 2, 12);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should_return_twelve_results_when_development_has_no_key', async () => {
    const previous = process.env.UNSPLASH_ACCESS_KEY;
    delete process.env.UNSPLASH_ACCESS_KEY;
    try {
      const result = await createAdapter('development', '').searchPhotos('cat');
      expect(result.results).toHaveLength(12);
      expect(new Set(result.results.map((photo) => photo.id)).size).toBe(12);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.UNSPLASH_ACCESS_KEY;
      else process.env.UNSPLASH_ACCESS_KEY = previous;
    }
  });

  it.each(['headers', 'body'])(
    'should_abort_within_five_seconds_when_provider_stalls_at_%s',
    async (stage) => {
      let signal: AbortSignal | null | undefined;
      fetchMock.mockImplementation(async (_url, options) => {
        signal = options?.signal;
        const stalled = () =>
          new Promise<never>((_resolve, reject) => {
            signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
          });
        if (stage === 'headers') return stalled();
        const response = new Response();
        jest.spyOn(response, 'json').mockImplementation(stalled);
        return response;
      });
      const started = Date.now();
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        const outcome = await Promise.race([
          createAdapter()
            .searchPhotos('cat')
            .then(
              (value) => value,
              (error: unknown) => error,
            ),
          new Promise<string>((resolve) => {
            deadline = setTimeout(() => resolve('deadline exceeded'), 5500);
          }),
        ]);
        expect(outcome).toEqual(new ImageSearchUnavailableException());
        expect(signal?.aborted).toBe(true);
        expect(Date.now() - started).toBeLessThan(5500);
      } finally {
        if (deadline) clearTimeout(deadline);
      }
    },
    7000,
  );
});
