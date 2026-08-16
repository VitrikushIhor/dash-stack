'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { logoutAction } from '../../api/actions/logout.action'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const res = await logoutAction()
      if (!res.success) {
        throw new Error(res.error)
      }
      return res.data
    },
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
