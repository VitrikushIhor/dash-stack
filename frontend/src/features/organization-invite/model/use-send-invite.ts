'use client'

import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/lib'
import type { CreateInvitationDto } from '@/entities/organization'
import { sendInviteAction } from '../api/actions/send-invite.action'

export function useSendInvite() {
  const router = useRouter()
  const { execute: executeSendInvite, isPending } = useAction(
    sendInviteAction,
    {
      successMessage: 'Invitation sent successfully',
    }
  )

  const sendInvite = async (
    slug: string,
    dto: CreateInvitationDto,
    options?: { onSuccess?: () => void }
  ) => {
    const invitation = await executeSendInvite({ slug, dto })

    if (invitation) {
      options?.onSuccess?.()
      router.refresh()
    }
  }

  return { sendInvite, isPending }
}
