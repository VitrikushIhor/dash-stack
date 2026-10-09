import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { AuthUser, UserEntity } from '../../../common/decorators/user.decorator';
import { CreateMatchSessionUseCase } from '../../application/use-cases/create-match-session.use-case';
import { CompleteMatchSessionUseCase } from '../../application/use-cases/complete-match-session.use-case';
import { GetMatchLeaderboardUseCase } from '../../application/use-cases/get-match-leaderboard.use-case';
import { RecordMatchPairUseCase } from '../../application/use-cases/record-match-pair.use-case';
import { MatchLeaderboardEntryReadModel } from '../../application/read-models/match.read-model';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import {
  CreateMatchSessionDto,
  RecordMatchPairDto,
  MatchLeaderboardQueryDto,
  parseCreateMatchBody,
  validateMatchCompletionBody,
} from '../dtos/match-request.dto';
import { normalizeRecordMatchPairDto } from '../mappers/match-request.mapper';
import {
  MatchCompletionResponseDto,
  MatchLeaderboardEntryResponseDto,
  MatchLeaderboardResponseDto,
  MatchSessionResponseDto,
} from '../dtos/match-response.dto';

const toEntry = (entry: MatchLeaderboardEntryReadModel): MatchLeaderboardEntryResponseDto => ({
  id: entry.id,
  deckId: entry.deckId,
  userId: entry.userId,
  durationMs: entry.durationMs,
  cardCount: entry.cardCount,
  createdAt: entry.createdAt.toISOString(),
  user: { ...entry.user },
});

@ApiTags('Vocabulary - Match')
@Controller('v1/vocab/decks/:deckId')
export class MatchController {
  constructor(
    private readonly create: CreateMatchSessionUseCase,
    private readonly complete: CompleteMatchSessionUseCase,
    private readonly leaderboard: GetMatchLeaderboardUseCase,
    private readonly recordPair: RecordMatchPairUseCase,
  ) {}

  @Post('match/sessions/:sessionId/pairs')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  async recordMatchedPair(
    @Param('deckId') deckId: string,
    @Param('sessionId') sessionId: string,
    @UserEntity() user: AuthUser,
    @Body() body: RecordMatchPairDto,
  ): Promise<void> {
    const attempt = normalizeRecordMatchPairDto(sessionId, body);
    await this.recordPair.execute({
      deckId,
      sessionId,
      userId: user.id,
      ...attempt,
    });
  }

  @Post('match/sessions')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiBody({ type: CreateMatchSessionDto, required: false })
  @ApiCreatedResponse({ type: MatchSessionResponseDto })
  async createSession(
    @Param('deckId') deckId: string,
    @UserEntity() user: AuthUser,
    @Body() body: unknown,
  ): Promise<MatchSessionResponseDto> {
    const dto = parseCreateMatchBody(body);
    const session = await this.create.execute({
      deckId,
      userId: user.id,
      onlyDue: dto.onlyDue,
      onlyStarred: dto.onlyStarred,
    });

    return {
      id: session.id,
      deckId: session.deckId,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      cards: session.cards.map((card) => ({ ...card })),
    };
  }

  @Post('match/sessions/:sessionId/complete')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOkResponse({ type: MatchCompletionResponseDto })
  async completeSession(
    @Param('deckId') deckId: string,
    @Param('sessionId') sessionId: string,
    @UserEntity() user: AuthUser,
    @Body() body: unknown,
  ): Promise<MatchCompletionResponseDto> {
    validateMatchCompletionBody(body);
    const result = await this.complete.execute({ deckId, sessionId, userId: user.id });

    return {
      sessionId: result.sessionId,
      durationMs: result.durationMs,
      cardCount: result.cardCount,
      completedAt: result.completedAt.toISOString(),
      bestResult: toEntry(result.bestResult),
    };
  }

  @Get('leaderboard')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOkResponse({ type: MatchLeaderboardResponseDto })
  async getLeaderboard(
    @Param('deckId') deckId: string,
    @UserEntity() user: AuthUser | null,
    @Query() query: MatchLeaderboardQueryDto,
  ): Promise<MatchLeaderboardResponseDto> {
    const result = await this.leaderboard.execute({
      deckId,
      userId: user?.id,
      page: query.page,
      perPage: query.perPage,
    });

    return {
      data: result.data.map(toEntry),
      meta: result.meta,
      currentUserBest: result.currentUserBest ? toEntry(result.currentUserBest) : null,
    };
  }
}
