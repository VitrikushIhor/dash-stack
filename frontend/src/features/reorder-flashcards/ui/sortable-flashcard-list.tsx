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

export function SortableFlashcardList({
  cards,
  onCardsReorder,
  onCardChange,
  onCardDelete,
  onOpenImagePicker,
}: SortableFlashcardListProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
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
  }

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
        <div className='space-y-4'>
          {cards.map((card, index) => (
            <SortableFlashcardItem
              key={card.id}
              card={card}
              index={index}
              onChange={(field, value) => onCardChange(card.id, field, value)}
              onDelete={() => onCardDelete(card.id)}
              onOpenImagePicker={() => onOpenImagePicker(card.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
