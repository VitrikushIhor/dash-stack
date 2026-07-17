import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { authApi } from '../../api/auth-api'
import { authKeys } from '../../api/auth-query-keys'
import { type AuthTokens } from '../types/auth.types'

const VERIFY_EMAIL_MUTATION_KEY = ['auth', 'verify-email'] as const

export function useVerifyEmail() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: VERIFY_EMAIL_MUTATION_KEY,
    mutationFn: authApi.verifyEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const mutationStates = useMutationState<AuthTokens>({
    filters: { mutationKey: VERIFY_EMAIL_MUTATION_KEY },
    select: (m) => m.state.data as AuthTokens,
  })

  const statuses = useMutationState({
    filters: { mutationKey: VERIFY_EMAIL_MUTATION_KEY },
    select: (m) => m.state.status,
  })

  const errors = useMutationState({
    filters: { mutationKey: VERIFY_EMAIL_MUTATION_KEY },
    select: (m) => m.state.error,
  })

  const latestStatus = statuses.at(-1)
  const latestError = errors.at(-1)

  return {
    mutate: mutation.mutate,
    isPending: latestStatus === 'pending',
    isSuccess: latestStatus === 'success',
    isError: latestStatus === 'error',
    error: latestError,
    data: mutationStates.at(-1),
  }
}
