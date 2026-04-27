import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../api/organization-api'
import { organizationKeys } from '../api/organization-query-keys'

export const useGetOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getAll,
  })
}
