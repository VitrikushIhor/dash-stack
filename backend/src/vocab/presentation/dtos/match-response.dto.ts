import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '../../../common/pagination/pagination.models';

export class MatchCardResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() deckId: string;
  @ApiProperty() term: string;
  @ApiProperty() definition: string;
}
export class MatchSessionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() deckId: string;
  @ApiProperty() startedAt: string;
  @ApiProperty() expiresAt: string;
  @ApiProperty({ type: [MatchCardResponseDto] }) cards: MatchCardResponseDto[];
}
export class MatchUserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) firstName: string | null;
  @ApiProperty({ nullable: true }) lastName: string | null;
  @ApiProperty({ nullable: true }) avatar: string | null;
}
export class MatchLeaderboardEntryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() deckId: string;
  @ApiProperty() userId: string;
  @ApiProperty() durationMs: number;
  @ApiProperty() cardCount: number;
  @ApiProperty() createdAt: string;
  @ApiProperty({ type: MatchUserResponseDto }) user: MatchUserResponseDto;
}
export class MatchLeaderboardResponseDto implements PaginatedResult<MatchLeaderboardEntryResponseDto> {
  @ApiProperty({ type: [MatchLeaderboardEntryResponseDto] })
  data: MatchLeaderboardEntryResponseDto[];
  @ApiProperty() meta: PaginatedResult<MatchLeaderboardEntryResponseDto>['meta'];
  @ApiProperty({ type: MatchLeaderboardEntryResponseDto, nullable: true })
  currentUserBest: MatchLeaderboardEntryResponseDto | null;
}
export class MatchCompletionResponseDto {
  @ApiProperty() sessionId: string;
  @ApiProperty() durationMs: number;
  @ApiProperty() cardCount: number;
  @ApiProperty() completedAt: string;
  @ApiProperty({ type: MatchLeaderboardEntryResponseDto })
  bestResult: MatchLeaderboardEntryResponseDto;
}
