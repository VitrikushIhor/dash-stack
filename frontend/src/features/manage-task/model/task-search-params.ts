'use client'

import { useQueryStates } from 'nuqs'
import { parseAsBoolean, parseAsString, createSerializer } from 'nuqs/server'

export const taskSearchParams = {
  'create-task': parseAsBoolean.withDefault(false),
  'update-task': parseAsString,
  'delete-task': parseAsString,
  'task-status': parseAsString,
}

export const serializeTaskSearchParams = createSerializer(taskSearchParams)

export function useTaskSearchParams() {
  return useQueryStates(taskSearchParams)
}
