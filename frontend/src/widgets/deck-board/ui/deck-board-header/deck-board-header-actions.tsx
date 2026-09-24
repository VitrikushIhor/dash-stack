import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { type Deck } from '@/entities/deck'
import { ExportDeckButton } from '@/features/export-flashcards'
import {
  ImportDialog,
  importFlashcardsAction,
} from '@/features/import-flashcards'
import { ForkDeckButton } from '@/features/manage-deck'

type DeckBoardHeaderActionsProps = {
  deck: Deck
  isOwner: boolean
  isAuthenticated: boolean
}

export const DeckBoardHeaderActions = ({
  deck,
  isOwner,
  isAuthenticated,
}: DeckBoardHeaderActionsProps) => {
  if (isOwner) {
    return (
      <>
        <ExportDeckButton deckId={deck.id} />
        <ImportDialog
          onConfirm={async (importId, cards) => {
            await importFlashcardsAction({
              deckId: deck.id,
              importId,
              cards,
            })

            return true
          }}
        />

        <Button asChild size='sm' className='gap-1.5'>
          <Link href={ROUTES.vocabDeckEdit(deck.id)}>
            <Pencil className='h-3.5 w-3.5' />
            <span>Edit deck</span>
          </Link>
        </Button>
      </>
    )
  }

  if (isAuthenticated) {
    return <ForkDeckButton deckId={deck.id} deckTitle={deck.title} />
  }

  return (
    <Button asChild variant='outline' size='sm'>
      <Link href={ROUTES.signIn}>Sign in to fork</Link>
    </Button>
  )
}
