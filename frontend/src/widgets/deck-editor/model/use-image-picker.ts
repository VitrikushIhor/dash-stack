import React from 'react'
import { type Flashcard } from '@/entities/deck'

export function useImagePicker(
  cards: (Partial<Flashcard> & { id: string })[],
  handleCardChange: (
    cardId: string,
    field: keyof Flashcard,
    value: string | null
  ) => void
) {
  const [activeCardIdForImage, setActiveCardIdForImage] = React.useState<
    string | null
  >(null)
  const [isImagePickerOpen, setIsImagePickerOpen] = React.useState(false)

  const handleOpenImagePicker = React.useCallback((cardId: string) => {
    setActiveCardIdForImage(cardId)
    setIsImagePickerOpen(true)
  }, [])

  const handleSelectImage = React.useCallback(
    (imageUrl: string) => {
      if (activeCardIdForImage) {
        handleCardChange(activeCardIdForImage, 'imageUrl', imageUrl)
      }
    },
    [activeCardIdForImage, handleCardChange]
  )

  const activeCardTerm = React.useMemo(() => {
    if (!activeCardIdForImage) return ''
    const card = cards.find((c) => c.id === activeCardIdForImage)
    return card?.term || ''
  }, [activeCardIdForImage, cards])

  return {
    isImagePickerOpen,
    setIsImagePickerOpen,
    activeCardTerm,
    handleOpenImagePicker,
    handleSelectImage,
  }
}
