'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config/constants/routes'
import { logoutAction } from './auth-actions'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out successfully')
      router.replace(ROUTES.signIn)
      router.refresh()
    },
    onError: () => {
      queryClient.clear()
      router.replace(ROUTES.signIn)
      router.refresh()
    },
  })
}
