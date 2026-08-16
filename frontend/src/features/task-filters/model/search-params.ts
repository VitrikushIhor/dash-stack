import { parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs/server'

export const tasksTableSearchParams = {
  filter: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  members: parseAsArrayOf(parseAsString).withDefault([]),
  labels: parseAsArrayOf(parseAsString).withDefault([]),
  dueDate: parseAsArrayOf(parseAsString).withDefault([]),
}
