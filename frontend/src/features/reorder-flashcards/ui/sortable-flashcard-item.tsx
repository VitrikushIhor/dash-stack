'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Flashcard, FlashcardRow } from '@/entities/deck'

interface SortableFlashcardItemProps {
  card: Partial<Flashcard> & { id: string }
  index: number
  onChange: (field: keyof Flashcard, value: string | null) => void
  onDelete: () => void
  onOpenImagePicker: () => void
}

export function SortableFlashcardItem({
  card,
  index,
  onChange,
  onDelete,
  onOpenImagePicker,
}: SortableFlashcardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <FlashcardRow
        card={card}
        index={index}
        dragHandleProps={{ ...attributes, ...listeners }}
        onChange={onChange}
        onDelete={onDelete}
        onOpenImagePicker={onOpenImagePicker}
      />
    </div>
  )
}
