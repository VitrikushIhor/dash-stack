import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { authApi } from '../../api/auth-api'
import { authKeys } from '../../api/auth-query-keys'

export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
