import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../api/organization-api'
import { organizationKeys } from '../api/organization-query-keys'

export const useGetMembers = (orgId: string) => {
  return useQuery({
    queryKey: organizationKeys.members(orgId),
    queryFn: () => organizationApi.getMembers(orgId),
    enabled: !!orgId,
  })
}
