import { InternalErrorException } from '../../../common/exceptions/domain.exception';
import { MatchCardReadModel } from '../../application/read-models/match.read-model';

const matchCardFields = ['id', 'deckId', 'term', 'definition'] as const;

function hasStringFields(
  value: unknown,
  fields: readonly string[],
): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    fields.every((field) => field in value && typeof value[field] === 'string')
  );
}

export function mapMatchCardQueryRows(value: unknown): MatchCardReadModel[] {
  if (!Array.isArray(value))
    throw new InternalErrorException('Match card query returned invalid rows.');

  return value.map((row) => {
    if (!hasStringFields(row, matchCardFields)) {
      throw new InternalErrorException('Match card query returned invalid rows.');
    }

    return {
      id: row.id,
      deckId: row.deckId,
      term: row.term,
      definition: row.definition,
    };
  });
}
