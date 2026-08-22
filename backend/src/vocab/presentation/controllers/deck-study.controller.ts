import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { GetStudyCardsUseCase } from '../../application/use-cases/get-study-cards.use-case';
import { SubmitStudyProgressUseCase } from '../../application/use-cases/submit-study-progress.use-case';
import { StudySessionQueryDto } from '../dtos/study-session-query.dto';
import { StudyCardResponseDto } from '../dtos/study-session-response.dto';
import { SubmitProgressDto } from '../dtos/submit-progress.dto';
import { VocabProgressResponseDto } from '../dtos/vocab-progress-response.dto';
import { VocabProgressPresentationMapper } from '../mappers/vocab-progress-presentation.mapper';

@ApiTags('Vocabulary - Study & Practice')
@Controller('v1/vocab/decks')
export class DeckStudyController {
  constructor(
    private readonly getStudyCardsUseCase: GetStudyCardsUseCase,
    private readonly submitStudyProgressUseCase: SubmitStudyProgressUseCase,
  ) {}

  @Get(':id/study')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get flashcards with user progress for interactive study session',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ordered flashcards with progress metadata returned successfully',
    type: [StudyCardResponseDto],
  })
  public async getStudyCards(
    @Param('id') deckId: string,
    @Query() query: StudySessionQueryDto,
    @UserEntity() user: AuthUser | null,
  ): Promise<StudyCardResponseDto[]> {
    const cards = await this.getStudyCardsUseCase.execute({
      userId: user ? user.id : null,
      deckId,
      mode: query.mode,
      onlyStarred: query.onlyStarred,
      onlyDue: query.onlyDue,
    });

    return VocabProgressPresentationMapper.toStudyCardResponseList(cards);
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit study session review results to advance Leitner SRS progress',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Study review results recorded and SRS schedules updated',
    type: [VocabProgressResponseDto],
  })
  public async submitProgress(
    @Param('id') deckId: string,
    @Body() dto: SubmitProgressDto,
    @UserEntity() user: AuthUser,
  ): Promise<VocabProgressResponseDto[]> {
    const results = await this.submitStudyProgressUseCase.execute({
      userId: user.id,
      deckId,
      results: dto.results,
    });

    return VocabProgressPresentationMapper.toVocabProgressResponseList(results);
  }
}
