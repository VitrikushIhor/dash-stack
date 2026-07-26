import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { logoutAction } from './auth-actions'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out successfully')
      router.replace('/sign-in')
      router.refresh()
    },
    onError: () => {
      queryClient.clear()
      router.replace('/sign-in')
      router.refresh()
    },
  })
}
