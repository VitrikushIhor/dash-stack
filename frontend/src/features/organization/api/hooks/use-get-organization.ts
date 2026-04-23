import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

export const useGetOrganization = (orgId: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(orgId),
    queryFn: () => organizationApi.getById(orgId),
    enabled: !!orgId,
  })
}
