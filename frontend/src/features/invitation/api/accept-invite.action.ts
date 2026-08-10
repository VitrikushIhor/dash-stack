'use server'

import { revalidateTag } from 'next/cache'
import { serverApi } from '@/shared/api/server-api-client'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { type Membership } from '@/shared/model'

export async function acceptInviteAction(token: string): Promise<Membership> {
  const result = await serverApi.post<Membership>(
    `/invitations/${token}/accept`
  )

  revalidateTag(SERVER_CACHE_TAGS.organizations)

  if (result?.orgId) {
    revalidateTag(SERVER_CACHE_TAGS.orgDetail(result.orgId))
    revalidateTag(SERVER_CACHE_TAGS.orgMembers(result.orgId))
  }

  return result
}
