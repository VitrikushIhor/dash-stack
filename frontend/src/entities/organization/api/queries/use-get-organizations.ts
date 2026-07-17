import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { userApi } from '@/entities/user'
import { organizationKeys } from '../../api/organization-query-keys'
import { type UserMembership } from '../../model/types/organization.types'

export const useGetOrganizations = (
  options?: Omit<UseQueryOptions<UserMembership[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: userApi.getMyMemberships,
    ...options,
  })
}
