import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createTaskApi } from './task-api'

export const taskServerApi = createTaskApi(serverApi)
