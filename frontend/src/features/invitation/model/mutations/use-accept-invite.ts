import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/shared/api'
import { acceptInviteAction } from '../../api/accept-invite.action'
import { invitationKeys } from '../../api/invitation-query-keys'

export const useAcceptInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: invitationKeys.accept(),
    mutationFn: (token: string) => acceptInviteAction(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
      toast.success('Invitation accepted successfully')
    },
  })
}
