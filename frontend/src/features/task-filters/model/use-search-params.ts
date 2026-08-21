'use client'

import { useQueryStates } from 'nuqs'
import { tasksTableSearchParams } from './search-params'

export function useTasksTableSearchParams() {
  return useQueryStates(tasksTableSearchParams, { shallow: false })
}
