import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createVocabApi } from '../api/vocab-api'

export const vocabServerApi = createVocabApi(serverApi)
