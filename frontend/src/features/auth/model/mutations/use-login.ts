import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { organizationKeys } from '@/entities/organization/api/organization-query-keys'
import { userApi } from '@/entities/user/api/user-api'
import { userKeys } from '@/entities/user/api/user-query-keys'
import { authApi } from '../../api/auth-api'

export function useLogin(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me() })

      const memberships = await queryClient.fetchQuery({
        queryKey: organizationKeys.lists(),
        queryFn: userApi.getMyMemberships,
      })

      toast.success(`Welcome back, ${variables.email}!`)

      if (memberships.length === 0) {
        navigate({ to: '/create-organization', replace: true })
        return
      }

      const targetPath = options?.redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
