import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createLabelApi } from './label-api'

export const labelServerApi = createLabelApi(serverApi)
