import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createInvitationApi } from './invitation-api'

export const invitationServerApi = createInvitationApi(serverApi)
