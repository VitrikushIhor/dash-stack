import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/api-helpers'
import authApi from '../../api/auth-api'

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
