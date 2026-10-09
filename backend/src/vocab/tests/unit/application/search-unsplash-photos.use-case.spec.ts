import { BadRequestException } from '@nestjs/common';
import { ImageSearchConfigurationException } from '../../../application/exceptions/image-search.exceptions';
import { SearchUnsplashPhotosUseCase } from '../../../application/use-cases/search-unsplash-photos.use-case';
import {
  UnsplashServicePort,
  UnsplashSearchResult,
} from '../../../application/ports/unsplash-service.port';
import { UnsplashAdapter } from '../../../infrastructure/integrations/unsplash.adapter';
import { ConfigService } from '@nestjs/config';

describe('SearchUnsplashPhotosUseCase & UnsplashAdapter', () => {
  let useCase: SearchUnsplashPhotosUseCase;
  let mockUnsplashService: jest.Mocked<UnsplashServicePort>;

  beforeEach(() => {
    mockUnsplashService = {
      searchPhotos: jest.fn().mockResolvedValue({
        results: [
          {
            id: 'photo-1',
            thumbUrl: 'https://images.unsplash.com/thumb.jpg',
            regularUrl: 'https://images.unsplash.com/regular.jpg',
            altDescription: 'Mountain landscape',
            photographerName: 'Jane Doe',
            photographerUrl: 'https://unsplash.com/@janedoe',
          },
        ],
        total: 1,
        totalPages: 1,
      } as UnsplashSearchResult),
    };

    useCase = new SearchUnsplashPhotosUseCase(mockUnsplashService);
  });

  it('should search photos with trimmed query and valid pagination', async () => {
    const result = await useCase.execute({
      query: '  mountain  ',
      page: 2,
      perPage: 10,
    });

    expect(mockUnsplashService.searchPhotos).toHaveBeenCalledWith('mountain', 2, 10);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('photo-1');
  });

  it('should throw BadRequestException if query is empty', async () => {
    await expect(useCase.execute({ query: '   ' })).rejects.toThrow(BadRequestException);
  });

  describe('UnsplashAdapter', () => {
    it('should return mock results in dev when access key is missing and cache the result with LRU', async () => {
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'NODE_ENV') return 'development';
          if (key === 'UNSPLASH_ACCESS_KEY') return undefined;
          return undefined;
        }),
      } as unknown as ConfigService;

      const adapter = new UnsplashAdapter(mockConfigService);
      const res1 = await adapter.searchPhotos('nature', 1, 5);

      expect(res1.results.length).toBeGreaterThan(0);
      expect(res1.results[0].id).toContain('mock-nature');

      // Second call should return cached response from LRUCache
      const res2 = await adapter.searchPhotos('nature', 1, 5);
      expect(res2).toEqual(res1);
    });

    it('should throw ImageSearchConfigurationException in production when access key is missing', async () => {
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'UNSPLASH_ACCESS_KEY') return undefined;
          return undefined;
        }),
      } as unknown as ConfigService;

      const adapter = new UnsplashAdapter(mockConfigService);
      await expect(adapter.searchPhotos('nature', 1, 5)).rejects.toThrow(
        ImageSearchConfigurationException,
      );
    });
  });
});
