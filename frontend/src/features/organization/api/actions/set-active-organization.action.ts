'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

export async function setActiveOrganizationAction(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CONFIG.ACTIVE_ORG_ID.name, orgId, {
    ...getCookieOptions(COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge),
    httpOnly: false,
  })

  revalidatePath('/', 'layout')
}
