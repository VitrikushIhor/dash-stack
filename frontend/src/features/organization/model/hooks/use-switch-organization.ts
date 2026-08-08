'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { setCookie, removeCookie } from '@/shared/lib/cookies'
import { organizationKeys } from '@/entities/organization'

const COOKIE_NAME = COOKIE_CONFIG.ACTIVE_ORG_ID.name
const COOKIE_MAX_AGE = COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge

export function useSwitchActiveOrganization() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const switchOrganization = useCallback(
    async (orgId: string, redirectTo?: string) => {
      setCookie(COOKIE_NAME, orgId, COOKIE_MAX_AGE)
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.all,
      })

      if (redirectTo) {
        router.push(redirectTo)
      }
    },
    [queryClient, router]
  )

  const clearActiveOrganization = useCallback(() => {
    removeCookie(COOKIE_NAME)
  }, [])

  return {
    switchOrganization,
    clearActiveOrganization,
  }
}
