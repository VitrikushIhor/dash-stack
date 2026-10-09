import { parseAsBoolean } from 'nuqs/server'

export const studySearchParams = {
  onlyDue: parseAsBoolean.withDefault(false),
  onlyStarred: parseAsBoolean.withDefault(false),
}
