import { useMemo, useEffect } from 'react'
import { useGetOrganizations } from '../../api/queries/use-get-organizations'
import { useOrgStore } from '../store/organization-store'

export function useActiveOrganization() {
  const { data: memberships, isLoading } = useGetOrganizations()
  const { activeOrgId, setActiveOrgId } = useOrgStore()

  const activeOrg = useMemo(() => {
    if (!memberships?.length) return null

    const selected = memberships.find((m) => m.organization.id === activeOrgId)
    return selected?.organization ?? memberships[0].organization
  }, [memberships, activeOrgId])

  // Sync back to store if missing, but only once we have data
  // This is better done centrally here rather than in a UI widget,
  // so the whole app agrees on what the active org is if none was set.
  useEffect(() => {
    if (memberships?.length && !activeOrgId) {
      setActiveOrgId(memberships[0].organization.id)
    }
  }, [memberships, activeOrgId, setActiveOrgId])

  return {
    activeOrg,
    memberships,
    isLoading,
    setActiveOrgId,
  }
}
