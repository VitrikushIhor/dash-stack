import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { createFlashcardApi } from '../api/flashcard-api'

export const flashcardServerApi = createFlashcardApi(serverApi)
