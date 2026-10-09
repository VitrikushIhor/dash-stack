import { parseUnsplashSearchResponse } from '../../../infrastructure/integrations/unsplash-response.parser';

describe('parseUnsplashSearchResponse', () => {
  it('should_parse_supported_provider_fields_when_payload_is_valid', () => {
    expect(
      parseUnsplashSearchResponse({
        results: [
          {
            id: 'photo-1',
            urls: { thumb: 'thumb', small: 'small', regular: 'regular' },
            alt_description: null,
            description: 'description',
            user: { name: 'Photographer', links: { html: 'profile' } },
          },
        ],
        total: 1,
        total_pages: 2,
      }),
    ).toEqual({
      results: [
        {
          id: 'photo-1',
          urls: { thumb: 'thumb', small: 'small', regular: 'regular' },
          altDescription: null,
          description: 'description',
          user: { name: 'Photographer', profileUrl: 'profile' },
        },
      ],
      total: 1,
      totalPages: 2,
    });
  });

  it.each([
    null,
    { results: {} },
    { results: [{ id: 12 }], total: 1, total_pages: 1 },
    { results: [{ id: 'photo', urls: { thumb: 12 } }], total: 1, total_pages: 1 },
    { results: [], total: -1, total_pages: 1 },
  ])('should_return_null_when_payload_is_invalid: %j', (payload: unknown) => {
    expect(parseUnsplashSearchResponse(payload)).toBeNull();
  });
});
