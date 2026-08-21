import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LRUCache } from 'lru-cache';
import {
  UnsplashImageResult,
  UnsplashSearchResult,
  UnsplashServicePort,
} from '../../application/ports/unsplash-service.port';

@Injectable()
export class UnsplashAdapter implements UnsplashServicePort {
  private readonly logger = new Logger(UnsplashAdapter.name);
  private readonly cache: LRUCache<string, UnsplashSearchResult>;

  constructor(private readonly configService: ConfigService) {
    this.cache = new LRUCache<string, UnsplashSearchResult>({
      max: 500,
      ttl: 10 * 60 * 1000, // 10 minutes
    });
  }

  async searchPhotos(
    query: string,
    page: number = 1,
    perPage: number = 12,
  ): Promise<UnsplashSearchResult> {
    const trimmedQuery = query.trim().toLowerCase();
    const cacheKey = `${trimmedQuery}:${page}:${perPage}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const accessKey =
      this.configService.get<string>('UNSPLASH_ACCESS_KEY') || process.env.UNSPLASH_ACCESS_KEY;
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';

    if (!accessKey) {
      if (isProduction) {
        this.logger.error('UNSPLASH_ACCESS_KEY is missing in production environment');
        throw new ServiceUnavailableException(
          'Image search service is currently unavailable. Please contact support.',
        );
      }
      this.logger.debug(
        `UNSPLASH_ACCESS_KEY is not set. Returning curated mock results for query "${trimmedQuery}".`,
      );
      const mockResult = this.generateMockResults(trimmedQuery, page, perPage);
      this.cache.set(cacheKey, mockResult);
      return mockResult;
    }

    try {
      const url = new URL('https://api.unsplash.com/search/photos');
      url.searchParams.set('query', trimmedQuery);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      url.searchParams.set('orientation', 'landscape');

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Unsplash API error: ${response.status} ${response.statusText}`);
        if (isProduction) {
          throw new BadGatewayException(
            `Failed to fetch images from provider: ${response.statusText}`,
          );
        }
        return this.generateMockResults(trimmedQuery, page, perPage);
      }

      const data = await response.json();
      const results: UnsplashImageResult[] = (data.results || []).map(
        (item: {
          id: string;
          urls?: { thumb?: string; small?: string; regular?: string };
          alt_description?: string;
          description?: string;
          user?: { name?: string; links?: { html?: string } };
        }) => ({
          id: item.id,
          thumbUrl: item.urls?.thumb || item.urls?.small || '',
          regularUrl: item.urls?.regular || item.urls?.small || '',
          altDescription: item.alt_description || item.description || trimmedQuery,
          photographerName: item.user?.name || 'Unsplash Photographer',
          photographerUrl: item.user?.links?.html || 'https://unsplash.com',
        }),
      );

      const searchResult: UnsplashSearchResult = {
        results,
        total: data.total ?? results.length,
        totalPages: data.total_pages ?? 1,
      };

      this.cache.set(cacheKey, searchResult);
      return searchResult;
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof BadGatewayException) {
        throw error;
      }
      this.logger.error(`Error fetching photos from Unsplash: ${(error as Error)?.message}`);
      if (isProduction) {
        throw new BadGatewayException('Error communicating with external image provider');
      }
      return this.generateMockResults(trimmedQuery, page, perPage);
    }
  }

  private generateMockResults(query: string, page: number, perPage: number): UnsplashSearchResult {
    const mockImages: UnsplashImageResult[] = [
      {
        id: `mock-${query}-1`,
        thumbUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&fit=crop',
        regularUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1080&fit=crop',
        altDescription: `${query} study learning concept`,
        photographerName: 'Unsplash Community',
        photographerUrl: 'https://unsplash.com',
      },
      {
        id: `mock-${query}-2`,
        thumbUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&fit=crop',
        regularUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1080&fit=crop',
        altDescription: `${query} books library education`,
        photographerName: 'Unsplash Community',
        photographerUrl: 'https://unsplash.com',
      },
      {
        id: `mock-${query}-3`,
        thumbUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&fit=crop',
        regularUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&fit=crop',
        altDescription: `${query} notebook writing vocabulary`,
        photographerName: 'Unsplash Community',
        photographerUrl: 'https://unsplash.com',
      },
      {
        id: `mock-${query}-4`,
        thumbUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&fit=crop',
        regularUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&fit=crop',
        altDescription: `${query} dictionary language words`,
        photographerName: 'Unsplash Community',
        photographerUrl: 'https://unsplash.com',
      },
    ];

    return {
      results: mockImages.slice(0, perPage),
      total: mockImages.length,
      totalPages: 1,
    };
  }
}
