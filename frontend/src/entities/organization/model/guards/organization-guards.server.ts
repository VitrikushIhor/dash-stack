'use server'

import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants/routes'
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
