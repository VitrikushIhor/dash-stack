'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { logoutAction } from '../../api/actions/logout.action'

export const useLogout = (): {
  isPending: boolean
  handleLogout: () => void
} => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLogout = () => {
    startTransition(async () => {
      const res = await logoutAction()

      if (!res.success) {
        handleServerError(res.error)
        return
      }

      toast.success(res.data.message)
      router.push(ROUTES.signIn)
    })
  }

  return {
    handleLogout,
    isPending,
  }
}
