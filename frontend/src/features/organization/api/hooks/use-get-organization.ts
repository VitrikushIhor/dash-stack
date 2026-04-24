import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { type Organization } from '../../model/types/organization.types'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

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
