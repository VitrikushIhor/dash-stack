import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createDeckApi } from '../api/deck-api'

export const deckServerApi = createDeckApi(serverApi)
