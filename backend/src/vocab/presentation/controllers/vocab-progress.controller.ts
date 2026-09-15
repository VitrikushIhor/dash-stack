import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { getAuthenticatedUserTracker } from '../../../common/throttling/authenticated-user-tracker';
import { GetDueReviewsUseCase } from '../../application/use-cases/get-due-reviews.use-case';
import { ToggleCardStarUseCase } from '../../application/use-cases/toggle-card-star.use-case';
import { DueReviewsQueryDto } from '../dtos/due-reviews-query.dto';
import { DueReviewsResponseDto } from '../dtos/due-reviews-response.dto';
import { ToggleStarResponseDto } from '../dtos/toggle-star-response.dto';
import { VocabProgressPresentationMapper } from '../mappers/vocab-progress-presentation.mapper';

@ApiTags('Vocabulary - Progress & Reviews')
@Controller('v1/vocab')
export class VocabProgressController {
  constructor(
    private readonly getDueReviewsUseCase: GetDueReviewsUseCase,
    private readonly toggleCardStarUseCase: ToggleCardStarUseCase,
  ) {}

  @Get('reviews/due')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get total and per-deck counts of cards due for SRS review today',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Due reviews statistics returned successfully',
    type: DueReviewsResponseDto,
  })
  public async getDueReviews(
    @UserEntity() user: AuthUser,
    @Query() query: DueReviewsQueryDto,
  ): Promise<DueReviewsResponseDto> {
    const result = await this.getDueReviewsUseCase.execute({
      userId: user.id,
      deckId: query.deckId,
    });

    return VocabProgressPresentationMapper.toDueReviewsResponse(result);
  }

  @Post('cards/:cardId/star')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
      getTracker: getAuthenticatedUserTracker,
    },
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle star state on a flashcard for focused practice',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flashcard star state toggled successfully',
    type: ToggleStarResponseDto,
  })
  public async toggleCardStar(
    @UserEntity() user: AuthUser,
    @Param('cardId') cardId: string,
  ): Promise<ToggleStarResponseDto> {
    const result = await this.toggleCardStarUseCase.execute({
      userId: user.id,
      flashcardId: cardId,
    });

    return VocabProgressPresentationMapper.toToggleStarResponse(result);
  }
}
