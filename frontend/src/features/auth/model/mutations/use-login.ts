import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api'
import { organizationKeys } from '@/entities/organization/api/organization-query-keys'
import { userApi } from '@/entities/user/api/user-api'
import { userKeys } from '@/entities/user/api/user-query-keys'
import { authApi } from '../../api/auth-api'

export function useLogin(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me() })

      let memberships: { organization: { id: string } }[] | null = null
      try {
        memberships = await queryClient.fetchQuery({
          queryKey: organizationKeys.lists(),
          queryFn: userApi.getMyMemberships,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch memberships during login:', err)
      }

      toast.success(`Welcome back, ${variables.email}!`)

      if (memberships !== null && memberships.length === 0) {
        router.replace('/create-organization')
        return
      }

      const targetPath = options?.redirectTo || '/dashboard'
      router.replace(targetPath)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
