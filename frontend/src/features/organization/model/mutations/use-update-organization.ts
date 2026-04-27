import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-helpers'
import { organizationApi } from '../api/organization-api'
import { organizationKeys } from '../api/organization-query-keys'

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: organizationApi.update,
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(orgId),
      })
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast.success('Organization updated successfully')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to update organization'
      toast.error(message)
    },
  })
}
