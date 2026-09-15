import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { getAuthenticatedUserTracker } from '../../../common/throttling/authenticated-user-tracker';
import { SearchUnsplashPhotosUseCase } from '../../application/use-cases/search-unsplash-photos.use-case';
import { UnsplashSearchQueryDto } from '../dtos/unsplash-search.dto';

@ApiTags('Vocabulary - Unsplash')
@Controller('v1/vocab/unsplash')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
export class UnsplashController {
  constructor(private readonly searchUnsplashPhotosUseCase: SearchUnsplashPhotosUseCase) {}

  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
      getTracker: getAuthenticatedUserTracker,
    },
  })
  @Get('search')
  @ApiOperation({ summary: 'Search photos via Unsplash proxy with caching' })
  @ApiResponse({
    status: 200,
    description: 'List of matching photos from Unsplash',
  })
  async search(@Query() queryDto: UnsplashSearchQueryDto) {
    return this.searchUnsplashPhotosUseCase.execute({
      query: queryDto.q,
      page: queryDto.page,
      perPage: queryDto.perPage,
    });
  }
}
