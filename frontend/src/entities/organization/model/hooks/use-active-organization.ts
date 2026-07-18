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

  useEffect(() => {
    const resolvedOrgId = activeOrg?.id
    if (resolvedOrgId && resolvedOrgId !== activeOrgId) {
      setActiveOrgId(resolvedOrgId)
    }
  }, [activeOrg?.id, activeOrgId, setActiveOrgId])

  return {
    activeOrg,
    memberships,
    isLoading,
    setActiveOrgId,
  }
}
