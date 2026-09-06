import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { type Deck, type Flashcard } from '@/entities/deck'
import { useDeckActions } from '@/features/manage-deck'
import { saveDeckEditorAction } from '@/features/manage-deck/server'
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
        const deckRes = await saveDeckEditorAction({
          id: deckId,
          data: {
            metadata: {
              title: metadata.title.trim(),
              description: metadata.description.trim(),
              level: metadata.level,
              visibility: metadata.visibility,
            },
            cards: flashcards.cards.map((card) => ({
              id: card.id.startsWith('temp-') ? undefined : card.id,
              term: card.term?.trim() ?? '',
              definition: card.definition?.trim() ?? '',
              example: card.example?.trim() || undefined,
              imageUrl: card.imageUrl || undefined,
            })),
            deletedCardIds: flashcards.deletedCardIds,
          },
        })

        if (!deckRes.success) {
          throw new Error(deckRes.error)
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
