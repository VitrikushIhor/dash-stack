import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createUserApi } from './user-api'

export const userServerApi = createUserApi(serverApi)
