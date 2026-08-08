import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { type UserMembership } from '../../model/types/organization.types'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

export const useGetOrganizations = (
  options?: Omit<UseQueryOptions<UserMembership[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getMyMemberships,
    ...options,
  })
}
