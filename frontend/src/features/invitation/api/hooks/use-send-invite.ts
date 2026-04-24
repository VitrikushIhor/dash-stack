import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-helpers'
import { invitationApi } from '../invitation-api'
import { invitationKeys } from '../invitation-query-keys'

export const useSendInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: invitationApi.sendInvite,
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.orgList(orgId) })
      toast.success('Invitation sent successfully')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Failed to send invitation'
      toast.error(message)
    },
  })
}
