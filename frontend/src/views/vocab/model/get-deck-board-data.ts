import 'server-only'
import { getDeckMetadataQuery } from '@/entities/deck/server'
import { getCurrentUser } from '@/entities/user/server'
import { getDeckCardsQuery } from '@/entities/vocab/server'

export async function getDeckBoardData(deckId: string) {
  const [deck, cards, currentUser] = await Promise.all([
    getDeckMetadataQuery(deckId),
    getDeckCardsQuery({ deckId, page: 1, perPage: 50 }),
    getCurrentUser(),
  ])

  return { deck, cards, currentUser }
}
