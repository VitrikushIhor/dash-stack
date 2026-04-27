import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { organizationApi } from '../api/organization-api'
import { organizationKeys } from '../api/organization-query-keys'
import { type Organization } from '../types/organization.types'

export const useGetOrganization = (
  orgId: string,
  options?: Omit<UseQueryOptions<Organization>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: organizationKeys.detail(orgId),
    queryFn: () => organizationApi.getById(orgId),
    enabled: !!orgId,
    ...options,
  })
}
