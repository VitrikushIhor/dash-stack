import { redirect } from 'next/navigation'
import 'server-only'
import { ROUTES } from '@/shared/config'
import { getOrganizationCount } from '../../api/queries/get-organizations-count.server'

export async function ensureCanCreateOrganization() {
  const count = await getOrganizationCount()

  if (count > 0) {
    redirect(ROUTES.organizations)
  }
}

export async function ensureHasOrganization() {
  const count = await getOrganizationCount()

  if (count === 0) {
    redirect(ROUTES.createOrganization)
  }
}
