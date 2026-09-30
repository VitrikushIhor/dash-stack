import 'server-only'
import { serverApi } from '@/shared/api/server'
import { createFlashcardApi } from '../api/flashcard-api'

export const flashcardServerApi = createFlashcardApi(serverApi)
