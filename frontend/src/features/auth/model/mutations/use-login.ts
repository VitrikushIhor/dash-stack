import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { authApi } from '../../api/auth-api'
import { authKeys } from '../../api/auth-query-keys'

export function useLogin(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user })

      toast.success(`Welcome back, ${variables.email}!`)
      const targetPath = options?.redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
