'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getErrorMessage, ApiError } from '@/shared/api/api-helpers'
import { serverApi } from '@/shared/api/server-api-client'
import { ROUTES } from '@/shared/config/constants/routes'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

interface CreateOrgPayload {
  name: string
  description?: string
  logo?: string
}

export type ActionState<T> =
  | { success: true; data: T }
  | { success: false; error: string; validationMessages?: string[] }

export async function createOrganizationAction(
  input: CreateOrgPayload
): Promise<ActionState<{ id: string }>> {
  try {
    const result = await serverApi.post<{ id: string }, CreateOrgPayload>(
      ROUTES.organizations,
      input
    )

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_CONFIG.ACTIVE_ORG_ID.name, result.id, {
      ...getCookieOptions(COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge),
      httpOnly: false,
    })

    revalidatePath(ROUTES.organizations)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        validationMessages: error.validationMessages,
      }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}
