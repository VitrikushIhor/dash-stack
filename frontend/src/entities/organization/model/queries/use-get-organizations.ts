import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { organizationApi } from '../../api/organization-api'
import { organizationKeys } from '../../api/organization-query-keys'
import { type UserMembership } from '../types/organization.types'

export const useGetOrganizations = (
  options?: Omit<UseQueryOptions<UserMembership[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getMyMemberships,
    ...options,
  })
}

// !TODO - legacy use server
