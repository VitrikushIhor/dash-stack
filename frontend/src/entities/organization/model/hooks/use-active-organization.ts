import { useMemo, useCallback } from 'react'
import { getCookie, setCookie, removeCookie } from '@/shared/lib/cookies'
import { useGetOrganizations } from '../../api/queries/use-get-organizations'

const COOKIE_NAME = 'active_org_id'

export function useActiveOrganization() {
  const { data: memberships, isLoading } = useGetOrganizations()

  const cookieOrgId = getCookie(COOKIE_NAME)

  const activeOrg = useMemo(() => {
    if (!memberships?.length) return null

    const selected = memberships.find((m) => m.organization.id === cookieOrgId)
    return selected?.organization ?? memberships[0].organization
  }, [memberships, cookieOrgId])

  const setActiveOrgId = useCallback((id: string | null) => {
    if (id) {
      setCookie(COOKIE_NAME, id)
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
