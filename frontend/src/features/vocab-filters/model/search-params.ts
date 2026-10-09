import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server'
import { CEFRLevelEnum } from '@/entities/deck'

const cefrLevels = Object.values(CEFRLevelEnum)

export const vocabCatalogSearchParams = {
  q: parseAsString,
  level: parseAsStringEnum(cefrLevels),
  language: parseAsString,
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
}
