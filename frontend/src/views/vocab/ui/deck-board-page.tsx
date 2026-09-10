import 'server-only'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { DeckBoard } from '@/widgets/deck-board'
import { getDeckBoardData } from '../model/get-deck-board-data'

type DeckBoardPageProps = {
  params: Promise<{ id: string }>
}

export async function DeckBoardPage({ params }: DeckBoardPageProps) {
  const { id } = await params
  const result = await getDeckBoardData(id)

  if (!result.deck.ok) {
    return <PageErrorHandler error={result.deck.error} />
  }
  if (!result.cards.ok) {
    return <PageErrorHandler error={result.cards.error} />
  }

  const user = result.currentUser.data ?? null
  return (
    <DeckBoard
      deck={result.deck.data}
      initialCardsPage={result.cards.data}
      isAuthenticated={user != null}
      isOwner={user?.id === result.deck.data.ownerUserId}
    />
  )
}
