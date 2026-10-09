'use client'

import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/lib'
import { revokeInviteAction } from '../api/actions/revoke-invite.action'

export function useRevokeInvite() {
  const router = useRouter()
  const { execute, isPending } = useAction(revokeInviteAction, {
    successMessage: 'Invitation revoked',
    onSuccess: () => router.refresh(),
  })

  const revokeInvite = (slug: string, invitationId: string) => {
    void execute({ slug, invitationId })
  }

  return { revokeInvite, isPending }
}
