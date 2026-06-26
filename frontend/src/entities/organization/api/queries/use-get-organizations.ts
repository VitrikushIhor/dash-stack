import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { organizationApi } from '../../api/organization-api'
import { organizationKeys } from '../../api/organization-query-keys'
import { type Organization } from '../../model/types/organization.types'

export const useGetOrganizations = (
  options?: Omit<UseQueryOptions<Organization[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getAll,
    ...options,
  })
}
