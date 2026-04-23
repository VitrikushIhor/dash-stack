import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-helpers'
import { organizationKeys } from '@/features/organization/api/organization-query-keys'
import { invitationApi } from '../invitation-api'

export const useAcceptInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: invitationApi.acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast.success('Invitation accepted successfully')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to accept invitation'
      toast.error(message)
    },
  })
}
