import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/api-helpers'
import { type SignupInput } from '../../model/types/auth.types'
import authApi from '../auth-api'

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
