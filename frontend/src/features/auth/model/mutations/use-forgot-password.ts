import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authApi from '../api/auth-api'

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('If an account exists, a reset email has been sent.')
    },
    onError: () => {
      toast.success('If an account exists, a reset email has been sent.')
    },
  })
}
