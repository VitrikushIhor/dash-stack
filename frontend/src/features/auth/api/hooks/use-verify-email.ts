import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/api-helpers'
import { authApi } from '../auth-api'
import { authKeys } from '../auth-query-keys'

export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: authKeys.user })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
