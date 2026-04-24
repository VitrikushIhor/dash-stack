import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

export const useGetOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: organizationApi.getAll,
  })
}
