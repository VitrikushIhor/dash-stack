import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authApi from '../auth-api'

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('If an account exists, a reset email has been sent.')
    },
    onError: () => {
      // Always show success to prevent email enumeration
      toast.success('If an account exists, a reset email has been sent.')
    },
  })
}
