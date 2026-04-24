import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '../organization-api'
import { organizationKeys } from '../organization-query-keys'

export const useGetMember = (orgId: string, userId: string) => {
  return useQuery({
    queryKey: organizationKeys.member(orgId, userId),
    queryFn: () => organizationApi.getMember({ orgId, userId }),
    enabled: !!orgId && !!userId,
  })
}
