import React from 'react'
import { Layers, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { SortableFlashcardList } from '@/features/reorder-flashcards'
import { type useFlashcards } from '../model/use-flashcards'
import { type useImagePicker } from '../model/use-image-picker'

interface DeckFlashcardsSectionProps {
  state: ReturnType<typeof useFlashcards>
  imagePickerState: ReturnType<typeof useImagePicker>
}

export function DeckFlashcardsSection({
  state,
  imagePickerState,
}: DeckFlashcardsSectionProps) {
  const { cards, setCards, handleAddCard, handleCardChange, handleCardDelete } =
    state
  const { handleOpenImagePicker } = imagePickerState
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-xl font-bold tracking-tight'>Flashcards</h2>
          <span className='bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold'>
            {cards.length}
          </span>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleAddCard}
          className='gap-1.5 text-xs'
        >
          <Plus className='h-3.5 w-3.5' />
          <span>Add Card</span>
        </Button>
      </div>

      {cards.length > 0 ? (
        <SortableFlashcardList
          cards={cards}
          onCardsReorder={setCards}
          onCardChange={handleCardChange}
          onCardDelete={handleCardDelete}
          onOpenImagePicker={handleOpenImagePicker}
        />
      ) : (
        <div className='border-border/80 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center'>
          <Layers className='text-muted-foreground/60 h-8 w-8' />
          <p className='mt-2 text-sm font-semibold'>No flashcards yet</p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleAddCard}
            className='mt-4 gap-1.5'
          >
            <Plus className='h-4 w-4' />
            <span>Add First Card</span>
          </Button>
        </div>
      )}

      {cards.length > 0 && (
        <div className='pt-2 text-center'>
          <Button
            type='button'
            variant='outline'
            onClick={handleAddCard}
            className='hover:border-primary hover:bg-primary/5 hover:text-primary w-full border-dashed py-5'
          >
            <Plus className='mr-2 h-4 w-4' />
            <span>Add New Card</span>
          </Button>
        </div>
      )}
    </div>
  )
}
