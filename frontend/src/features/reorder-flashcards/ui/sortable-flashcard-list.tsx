'use client'

import React from 'react'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { type Flashcard } from '@/entities/deck'
import { SortableFlashcardItem } from './sortable-flashcard-item'

interface SortableFlashcardListProps {
  cards: (Partial<Flashcard> & { id: string })[]
  onCardsReorder: (newCards: (Partial<Flashcard> & { id: string })[]) => void
  onCardChange: (
    cardId: string,
    field: keyof Flashcard,
    value: string | null
  ) => void
  onCardDelete: (cardId: string) => void
  onOpenImagePicker: (cardId: string) => void
}

const VIRTUALIZATION_THRESHOLD = 50
const ESTIMATED_CARD_HEIGHT_PX = 260

export function SortableFlashcardList({
  cards,
  onCardsReorder,
  onCardChange,
  onCardDelete,
  onOpenImagePicker,
}: SortableFlashcardListProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const shouldVirtualize = cards.length > VIRTUALIZATION_THRESHOLD
  const getScrollElement = React.useCallback(
    () => scrollContainerRef.current,
    []
  )
  const getItemKey = React.useCallback(
    (index: number) => cards[index]?.id ?? index,
    [cards]
  )

  const virtualizer = useVirtualizer({
    count: cards.length,
    enabled: shouldVirtualize,
    getScrollElement,
    getItemKey,
    estimateSize: () => ESTIMATED_CARD_HEIGHT_PX,
    overscan: 5,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = cards.findIndex((item) => item.id === active.id)
        const newIndex = cards.findIndex((item) => item.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(cards, oldIndex, newIndex).map(
            (card, idx) => ({
              ...card,
              position: idx,
            })
          )
          onCardsReorder(reordered)
        }
      }
    },
    [cards, onCardsReorder]
  )

  const renderCard = React.useCallback(
    (card: Partial<Flashcard> & { id: string }, index: number) => (
      <SortableFlashcardItem
        key={card.id}
        card={card}
        index={index}
        onCardChange={onCardChange}
        onCardDelete={onCardDelete}
        onOpenImagePicker={onOpenImagePicker}
      />
    ),
    [onCardChange, onCardDelete, onOpenImagePicker]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {shouldVirtualize ? (
          <div
            ref={scrollContainerRef}
            aria-label='Flashcards'
            className='max-h-[70vh] overflow-y-auto pr-2'
          >
            <div
              className='relative w-full'
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualCard) => {
                const card = cards[virtualCard.index]
                if (!card) return null

                return (
                  <div
                    key={virtualCard.key}
                    ref={virtualizer.measureElement}
                    data-index={virtualCard.index}
                    className='absolute top-0 left-0 w-full pb-4'
                    style={{ transform: `translateY(${virtualCard.start}px)` }}
                  >
                    {renderCard(card, virtualCard.index)}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {cards.map((card, index) => renderCard(card, index))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  )
}
