import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createOrganizationApi } from './organization-api'

export const organizationServerApi = createOrganizationApi(serverApi)
