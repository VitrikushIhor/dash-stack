import { CreateOrganization } from '@/views/create-organization'
import { ensureCanCreateOrganization } from '@/entities/organization/server'

export default async function CreateOrganizationRoute() {
  await ensureCanCreateOrganization()

  return <CreateOrganization />
}
