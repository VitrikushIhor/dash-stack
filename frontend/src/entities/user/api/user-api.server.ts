import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createUserApi } from './user-api'

export const userServerApi = createUserApi(serverApi)
