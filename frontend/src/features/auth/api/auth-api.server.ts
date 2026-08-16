import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createAuthApi } from './auth-api'

export const authServerApi = createAuthApi(serverApi)
