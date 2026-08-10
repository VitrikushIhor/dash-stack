'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

export async function setActiveOrganizationAction(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CONFIG.ACTIVE_ORG_ID.name, orgId, {
    ...getCookieOptions(COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge),
    httpOnly: false,
  })

  revalidateTag(SERVER_CACHE_TAGS.organizations)
  revalidateTag(SERVER_CACHE_TAGS.orgDetail(orgId))
  revalidatePath('/', 'layout')
}
