import {
  parseAsBoolean,
  parseAsString,
  createSerializer,
  useQueryStates,
} from 'nuqs'

export const labelSearchParams = {
  'create-label': parseAsBoolean.withDefault(false),
  'update-label': parseAsString,
  'delete-label': parseAsString,
}

export const serializeLabelSearchParams = createSerializer(labelSearchParams)

export function useLabelSearchParams() {
  return useQueryStates(labelSearchParams)
}
