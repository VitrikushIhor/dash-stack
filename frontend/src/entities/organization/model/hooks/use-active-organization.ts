import { useMemo, useCallback } from 'react'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
import { useGetOrganizations } from '../queries/use-get-organizations'

const COOKIE_NAME = COOKIE_CONFIG.ACTIVE_ORG_ID.name
const COOKIE_MAX_AGE = COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge

export function useActiveOrganization() {
  const { data: memberships, isLoading } = useGetOrganizations()

  const cookieOrgId = getCookie(COOKIE_NAME)

  const activeOrg = useMemo(() => {
    if (!memberships?.length) return null

    const selected = memberships.find((m) => m.organization.id === cookieOrgId)
    if (selected) return selected.organization

    return memberships[0].organization
  }, [memberships, cookieOrgId])

  const setActiveOrgId = useCallback((id: string | null) => {
    if (id) {
      setCookie(COOKIE_NAME, id, COOKIE_MAX_AGE)
    } else {
      removeCookie(COOKIE_NAME)
    }
  }, [])

  return {
    activeOrg,
    memberships,
    isLoading,
    setActiveOrgId,
  }
}

// !TODO CHANGE TO SERVER getActiveOrganization !!!
