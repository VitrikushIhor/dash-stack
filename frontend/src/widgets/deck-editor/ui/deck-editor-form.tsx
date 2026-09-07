'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { type Deck, type Flashcard } from '@/entities/deck'
import { useDeckEditor } from '../model/use-deck-editor'
import { DeckEditorHeader } from './deck-editor-header'
import { DeckFlashcardsSection } from './deck-flashcards-section'
import { DeckMetadataForm } from './deck-metadata-form'

const UnsplashPickerDialog = dynamic(
  () =>
    import('@/features/unsplash-picker').then(
      (mod) => mod.UnsplashPickerDialog
    ),
  { ssr: false }
)

interface DeckEditorFormProps {
  initialDeck: Deck & { flashcards?: Flashcard[] }
}

export function DeckEditorForm({ initialDeck }: DeckEditorFormProps) {
  const editorState = useDeckEditor(initialDeck)

  return (
    <div className='space-y-8 pb-20'>
      <DeckEditorHeader state={editorState} />
      <fieldset
        disabled={editorState.isSaving}
        inert={editorState.isSaving}
        className='space-y-8'
      >
        <DeckMetadataForm state={editorState.metadata} />
        <DeckFlashcardsSection
          state={editorState.flashcards}
          imagePickerState={editorState.imagePicker}
        />
      </fieldset>
      <UnsplashPickerDialog
        open={editorState.imagePicker.isImagePickerOpen}
        onOpenChange={editorState.imagePicker.setIsImagePickerOpen}
        initialQuery={editorState.imagePicker.activeCardTerm}
        onSelectImage={editorState.imagePicker.handleSelectImage}
      />
    </div>
  )
}
