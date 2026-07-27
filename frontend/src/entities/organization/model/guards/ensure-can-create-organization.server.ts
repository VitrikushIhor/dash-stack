'use server'

import { redirect } from 'next/navigation'
import { getOrganizationCount } from '../../api/queries/get-organizations-count.server'

export async function ensureCanCreateOrganization() {
  const count = await getOrganizationCount()

  if (count > 0) {
    redirect('/organizations')
  }
}
