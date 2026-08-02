'use server'

import { revalidatePath } from 'next/cache'
import { serverApi } from '@/shared/api/server-api-client'
import { ROUTES } from '@/shared/config/constants/routes'
import { type Membership } from '@/shared/model'

export async function acceptInviteAction(token: string): Promise<Membership> {
  const result = await serverApi.post<Membership>(
    `/invitations/${token}/accept`
  )
  revalidatePath(ROUTES.organizations)
  return result
}
