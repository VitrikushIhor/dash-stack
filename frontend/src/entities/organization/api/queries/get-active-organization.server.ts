import { cookies } from 'next/headers'
import 'server-only'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import {
  type OrganizationSummary,
  type UserMembership,
} from '../../model/types/organization.types'
import { getUserOrganizations } from './get-user-organizations.server'

type GetActiveOrganizationResponse = {
  activeOrg: OrganizationSummary | null
  memberships: UserMembership[] | null
  error: string | null
}

export async function getActiveOrganization(): Promise<GetActiveOrganizationResponse> {
  const { data: memberships, error } = await getUserOrganizations()

  if (error || !memberships || memberships.length === 0) {
    return { activeOrg: null, memberships: memberships || null, error }
  }

  const cookieStore = await cookies()
  const cookieOrgId = cookieStore.get(COOKIE_CONFIG.ACTIVE_ORG_ID.name)?.value

  const selectedMembership = memberships.find(
    (m) => m.organization.id === cookieOrgId
  )

  const activeOrg = selectedMembership
    ? selectedMembership.organization
    : memberships[0].organization

  return {
    activeOrg,
    memberships,
    error: null,
  }
}
