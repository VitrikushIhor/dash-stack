import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type Deck, type Flashcard } from '@/entities/deck'
import { useDeckActions } from '@/features/manage-deck'
import { updateDeckAction } from '@/features/manage-deck/server'
import { batchSaveFlashcardsAction } from '@/features/manage-flashcard/server'
import { useDeckMetadata } from './use-deck-metadata'
import { useFlashcards } from './use-flashcards'
import { useImagePicker } from './use-image-picker'

export function useDeckEditor(
  initialDeck: Deck & { flashcards?: Flashcard[] }
) {
  const router = useRouter()
  const deckId = initialDeck.id

  const metadata = useDeckMetadata(initialDeck)
  const flashcards = useFlashcards(deckId, initialDeck.flashcards)
  const imagePicker = useImagePicker(
    flashcards.cards,
    flashcards.handleCardChange
  )

  const { publishDeck, unpublishDeck } = useDeckActions()
  const [isSaving, startTransition] = useTransition()

  const handleSaveChanges = async () => {
    if (!metadata.title.trim()) {
      toast.error('Deck title cannot be empty')
      return
    }

    startTransition(async () => {
      try {
        const deckRes = await updateDeckAction({
          id: deckId,
          data: {
            title: metadata.title.trim(),
            description: metadata.description.trim(),
            level: metadata.level,
            visibility: metadata.visibility,
          },
        })

        if (!deckRes.success) {
          throw new Error(deckRes.error)
        }

        const validCards = flashcards.cards
          .filter((c) => c.term?.trim() || c.definition?.trim())
          .map((c, i) => ({
            id: c.id,
            term: c.term?.trim() || '',
            definition: c.definition?.trim() || '',
            example: c.example?.trim() || undefined,
            imageUrl: c.imageUrl || undefined,
            position: i,
            isNew: c.id.startsWith('temp-'),
          }))

        if (validCards.length > 0 || flashcards.deletedCardIds.length > 0) {
          const cardsRes = await batchSaveFlashcardsAction({
            deckId,
            cards: validCards,
            deletedCardIds: flashcards.deletedCardIds,
          })

          if (!cardsRes.success) {
            throw new Error(cardsRes.error)
          }
        }

        router.refresh()
        toast.success('All changes saved successfully!')
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Failed to save changes'
        toast.error(msg)
      }
    })
  }

  return {
    deck: initialDeck,
    isSaving,
    handleSaveChanges,
    publishDeck,
    unpublishDeck,
    metadata,
    flashcards,
    imagePicker,
  }
}
