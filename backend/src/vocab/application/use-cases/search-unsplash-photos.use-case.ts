import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UnsplashSearchResult, UnsplashServicePort } from '../ports/unsplash-service.port';

export interface SearchUnsplashPhotosQuery {
  query: string;
  page?: number;
  perPage?: number;
}

@Injectable()
export class SearchUnsplashPhotosUseCase {
  constructor(
    @Inject('UnsplashServicePort')
    private readonly unsplashService: UnsplashServicePort,
  ) {}

  async execute(queryDto: SearchUnsplashPhotosQuery): Promise<UnsplashSearchResult> {
    const trimmed = queryDto.query?.trim();
    if (!trimmed) {
      throw new BadRequestException('Search query is required');
    }

    return this.unsplashService.searchPhotos(trimmed, queryDto.page ?? 1, queryDto.perPage ?? 12);
  }
}
