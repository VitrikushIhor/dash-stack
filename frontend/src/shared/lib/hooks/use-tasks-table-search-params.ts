'use client'

import {
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  createSerializer,
  useQueryStates,
} from 'nuqs'

export const tasksTableSearchParams = {
  filter: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  members: parseAsArrayOf(parseAsString).withDefault([]),
  labels: parseAsArrayOf(parseAsString).withDefault([]),
  dueDate: parseAsArrayOf(parseAsString).withDefault([]),
}

export const serializeTasksTableSearchParams = createSerializer(
  tasksTableSearchParams
)

export function useTasksTableSearchParams() {
  return useQueryStates(tasksTableSearchParams)
}
