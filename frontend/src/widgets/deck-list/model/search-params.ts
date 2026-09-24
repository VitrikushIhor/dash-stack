import { parseAsString, parseAsStringEnum } from 'nuqs/server'

export const FilterTabEnum = {
  ALL: 'ALL',
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const

export const myDecksSearchParams = {
  q: parseAsString.withDefault(''),
  tab: parseAsStringEnum<keyof typeof FilterTabEnum>(
    Object.values(FilterTabEnum)
  ).withDefault('ALL'),
}
