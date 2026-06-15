import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError, QUERY_KEYS } from '@/shared/api'
import { invitationApi } from '../../api/invitation-api'

export const useAcceptInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: invitationApi.acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
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
