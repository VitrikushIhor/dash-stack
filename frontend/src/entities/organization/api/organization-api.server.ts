import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createOrganizationApi } from './organization-api'

export const organizationServerApi = createOrganizationApi(serverApi)
