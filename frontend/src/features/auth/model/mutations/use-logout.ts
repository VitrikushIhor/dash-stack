import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clearTokens } from '@/shared/api'
import { authApi } from '../../api/auth-api'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out successfully')
      router.replace('/sign-in')
    },
    onError: async () => {
      await clearTokens()
      queryClient.clear()
      router.replace('/sign-in')
    },
  })
}
