import { parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'

export const vocabCatalogSearchParams = {
  q: parseAsString,
  level: parseAsString,
  language: parseAsString,
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
}
