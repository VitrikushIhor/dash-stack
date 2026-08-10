import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createInvitationApi } from './invitation-api'

export const invitationServerApi = createInvitationApi(serverApi)
