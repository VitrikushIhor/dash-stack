'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { revokeInviteAction } from '../api/actions/revoke-invite.action'

export function useRevokeInvite() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const revokeInvite = (slug: string, invitationId: string) => {
    startTransition(async () => {
      const result = await revokeInviteAction(slug, invitationId)
      if (!result.success) {
        handleServerError(result.error)
        return
      }
      toast.success('Invitation revoked')
      router.refresh()
    })
  }

  return { revokeInvite, isPending }
}
