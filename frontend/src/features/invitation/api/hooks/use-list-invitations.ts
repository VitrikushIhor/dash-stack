import { useQuery } from '@tanstack/react-query'
import { invitationApi } from '../invitation-api'
import { invitationKeys } from '../invitation-query-keys'

export const useListInvitations = (orgId: string) => {
  return useQuery({
    queryKey: invitationKeys.orgList(orgId),
    queryFn: () => invitationApi.listPending(orgId),
    enabled: !!orgId,
  })
}
