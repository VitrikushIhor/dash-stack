import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api'
import { organizationApi } from '../../api/organization-api'
import { organizationKeys } from '../../api/organization-query-keys'

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast.success('Organization deleted successfully')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to delete organization'
      toast.error(message)
    },
  })
}
