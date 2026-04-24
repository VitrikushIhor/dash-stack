import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

export const useGetMembers = (orgId: string) => {
  return useQuery({
    queryKey: organizationKeys.members(orgId),
    queryFn: () => organizationApi.getMembers(orgId),
    enabled: !!orgId,
  })
}
