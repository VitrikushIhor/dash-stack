import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createVocabApi } from '../api/vocab-api'

export const vocabServerApi = createVocabApi(serverApi)
