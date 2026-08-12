import {
  parseAsBoolean,
  parseAsString,
  createSerializer,
  useQueryStates,
} from 'nuqs'

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
