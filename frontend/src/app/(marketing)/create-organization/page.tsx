import { ensureCanCreateOrganization } from '@/entities/organization/server'
import { CreateOrganization } from '@/views/create-organization'

export default async function CreateOrganizationRoute() {
  await ensureCanCreateOrganization()

  return <CreateOrganization />
}
