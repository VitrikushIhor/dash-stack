import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createLabelApi } from './label-api'

export const labelServerApi = createLabelApi(serverApi)
