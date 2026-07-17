import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type Membership } from '@/shared/model'
import { organizationApi } from '../../api/organization-api'
import { organizationKeys } from '../../api/organization-query-keys'

export const useGetMember = (orgId: string, userId: string) => {
  const queryClient = useQueryClient()

  // get shallow data from list cache if available
  const cachedMembers = queryClient.getQueryData<Membership[]>(
    organizationKeys.members(orgId)
  )
  const initialData = cachedMembers?.find(
    (m) => m.userId === userId || m.user?.id === userId
  )

  return useQuery({
    queryKey: organizationKeys.member(orgId, userId),
    queryFn: () => organizationApi.getMember({ orgId, userId }),
    enabled: !!orgId && !!userId,
    initialData,
    // mark as stale -> trigger immediate background refetch for full data
    initialDataUpdatedAt: initialData ? 0 : undefined,
  })
}
