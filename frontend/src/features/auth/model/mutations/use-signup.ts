import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/api-helpers'
import authApi from '../../api/auth-api'
import { type SignupInput } from '../types/auth.types'

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
