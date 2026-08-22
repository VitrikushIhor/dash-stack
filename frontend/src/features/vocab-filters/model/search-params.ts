import { parseAsInteger, parseAsString } from 'nuqs/server'

export const vocabCatalogSearchParams = {
  q: parseAsString,
  level: parseAsString,
  page: parseAsInteger.withDefault(1),
}
