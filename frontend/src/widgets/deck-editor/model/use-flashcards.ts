import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { type Flashcard } from '@/entities/deck'

export function useFlashcards(initialCards: Flashcard[] = []) {
  const [cards, setCards] = useState<(Partial<Flashcard> & { id: string })[]>(
    () =>
      initialCards.length > 0
        ? initialCards
        : [
            { id: 'temp-init-1', term: '', definition: '', position: 0 },
            { id: 'temp-init-2', term: '', definition: '', position: 1 },
          ]
  )

  const [deletedCardIds, setDeletedCardIds] = useState<string[]>([])

  const handleAddCard = useCallback(() => {
    setCards((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        term: '',
        definition: '',
        position: prev.length,
      },
    ])
  }, [])

  const handleCardChange = useCallback(
    (cardId: string, field: keyof Flashcard, value: string | null) => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, [field]: value } : card
        )
      )
    },
    []
  )

  const handleCardDelete = useCallback((cardId: string) => {
    if (!cardId.startsWith('temp-')) {
      setDeletedCardIds((prev) => [...prev, cardId])
    }
    setCards((prev) => prev.filter((card) => card.id !== cardId))
    toast.info('Card removed (will be permanently deleted on save)')
  }, [])

  return {
    cards,
    setCards,
    deletedCardIds,
    setDeletedCardIds,
    handleAddCard,
    handleCardChange,
    handleCardDelete,
  }
}
