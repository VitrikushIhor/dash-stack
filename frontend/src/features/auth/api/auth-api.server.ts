import 'server-only'
import { createServerApiClient } from '@/shared/api/server'
import { persistAuthCookies } from '@/shared/api/session/persist-auth-cookies'
import { createAuthApi } from './auth-api'

const authServerHttpClient = createServerApiClient(persistAuthCookies)

export const authServerApi = createAuthApi(authServerHttpClient)
