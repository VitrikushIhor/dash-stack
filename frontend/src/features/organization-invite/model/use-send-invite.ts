'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import type { CreateInvitationDto } from '@/entities/organization'
import { sendInviteAction } from '../api/actions/send-invite.action'

export function useSendInvite() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const sendInvite = (
    orgId: string,
    dto: CreateInvitationDto,
    options?: { onSuccess?: () => void }
  ) => {
    startTransition(async () => {
      const result = await sendInviteAction(orgId, dto)
      if (!result.success) {
        handleServerError(
          result.validationMessages?.length
            ? result.validationMessages
            : result.error
        )
        return
      }
      toast.success('Invitation sent successfully')
      options?.onSuccess?.()
      router.refresh()
    })
  }

  return { sendInvite, isPending }
}
