'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OrgRole } from '@/shared/model'
import { InviteFormSchema, type InviteFormValues } from './invitation.schema'
import { useSendInvite } from './use-send-invite'

interface UseInviteMemberFormProps {
  slug: string
  onSuccess?: () => void
}

export function useInviteMemberForm({
  slug,
  onSuccess,
}: UseInviteMemberFormProps) {
  const { sendInvite, isPending } = useSendInvite()

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: { email: '', role: OrgRole.MEMBER },
  })

  const onSubmit = (values: InviteFormValues) => {
    sendInvite(slug, values, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      },
    })
  }

  return { form, onSubmit, isPending }
}
