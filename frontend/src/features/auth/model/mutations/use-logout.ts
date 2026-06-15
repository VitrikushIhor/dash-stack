import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { clearTokens } from '@/shared/api/api-helpers'
import { authApi } from '../../api/auth-api'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
      toast.success('Logged out successfully')
      navigate({ to: '/sign-in', replace: true })
    },
    onError: () => {
      // Still clear tokens and redirect on error
      clearTokens()
      queryClient.clear()
      navigate({ to: '/sign-in', replace: true })
    },
  })
}
