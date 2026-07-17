import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { userKeys } from '@/entities/user/api/user-query-keys'
import { authApi } from '../../api/auth-api'

export function useLogin(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me() })

      toast.success(`Welcome back, ${variables.email}!`)
      const targetPath = options?.redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
