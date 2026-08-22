import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createDeckApi } from '../api/deck-api'

export const deckServerApi = createDeckApi(serverApi)
