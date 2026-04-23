import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OrgRole } from '@/features/organization/model/types/organization.types'
import { useSendInvite } from '../../api/hooks/use-send-invite'
import {
  InviteSchema,
  type InviteFormValues,
} from '../../model/schema/invitation-schema'

interface UseInviteMemberFormProps {
  orgId: string
  onSuccess?: () => void
}

export const useInviteMemberForm = ({
  orgId,
  onSuccess,
}: UseInviteMemberFormProps) => {
  const { mutate: sendInvite, isPending } = useSendInvite()

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(InviteSchema),
    defaultValues: {
      email: '',
      role: OrgRole.MEMBER,
    },
  })

  const onSubmit = (values: InviteFormValues) => {
    sendInvite(
      { orgId, dto: values },
      {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      }
    )
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
