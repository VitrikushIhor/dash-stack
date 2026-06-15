import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api'
import { invitationApi } from '../../api/invitation-api'
import { invitationKeys } from '../../api/invitation-query-keys'

export const useRevokeInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: invitationApi.revokeInvite,
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.orgList(orgId) })
      toast.success('Invitation revoked successfully')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to revoke invitation'
      toast.error(message)
    },
  })
}
