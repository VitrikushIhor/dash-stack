import { BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  MatchTileSide,
  type RecordMatchPairCommand,
} from '../../application/commands/match-session.command';
import { PayloadHash } from '../../application/constants/payload-hash.constants';
import { RecordMatchPairDto } from '../dtos/match-request.dto';

type NormalizedMatchPair = Pick<RecordMatchPairCommand, 'attemptId' | 'first' | 'second'>;

function legacyAttemptId(sessionId: string, cardId: string): string {
  const hex = createHash(PayloadHash.algorithm)
    .update(`${sessionId}:${cardId}`)
    .digest(PayloadHash.encoding)
    .slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
}

export function normalizeRecordMatchPairDto(
  sessionId: string,
  body: RecordMatchPairDto,
): NormalizedMatchPair {
  if (body.cardId) {
    return {
      attemptId: body.attemptId ?? legacyAttemptId(sessionId, body.cardId),
      first: body.first ?? { cardId: body.cardId, side: MatchTileSide.TERM },
      second: body.second ?? { cardId: body.cardId, side: MatchTileSide.DEFINITION },
    };
  }
  if (body.attemptId && body.first && body.second) {
    return { attemptId: body.attemptId, first: body.first, second: body.second };
  }
  throw new BadRequestException('Invalid match attempt');
}
