import { useCallback, useMemo, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { logger } from '@/shared/lib'
import { type Deck, type Flashcard } from '@/entities/deck'
import { useDeckActions } from '@/features/manage-deck'
import { saveDeckEditorAction } from '@/features/manage-deck/server'
import {
  type DeckEditorDraftState,
  type DraftErrorContext,
  useDeckEditorDraft,
} from './use-deck-editor-draft'
import { useDeckMetadata } from './use-deck-metadata'
import { useFlashcards } from './use-flashcards'
import { useImagePicker } from './use-image-picker'

export function useDeckEditor(
  initialDeck: Deck & { flashcards?: Flashcard[] }
) {
  const router = useRouter()
  const deckId = initialDeck.id

  const metadata = useDeckMetadata(initialDeck)
  const flashcards = useFlashcards(initialDeck.flashcards)
  const imagePicker = useImagePicker(
    flashcards.cards,
    flashcards.handleCardChange
  )

  const { publishDeck, unpublishDeck } = useDeckActions()
  const [isSaving, startTransition] = useTransition()
  const savingRef = useRef(false)
  const { setIsImagePickerOpen } = imagePicker
  const {
    setTitle,
    setDescription,
    setLanguage,
    setTags,
    setLevel,
    setVisibility,
  } = metadata

  const { setCards, setDeletedCardIds } = flashcards

  const applyState = useCallback(
    (state: DeckEditorDraftState) => {
      setTitle(state.metadata.title)
      setDescription(state.metadata.description)
      setLanguage(state.metadata.language)
      setTags(state.metadata.tags)
      setLevel(state.metadata.level)
      setVisibility(state.metadata.visibility)
      setCards(state.cards)
      setDeletedCardIds(state.deletedCardIds)
    },
    [
      setTitle,
      setDescription,
      setLanguage,
      setTags,
      setLevel,
      setVisibility,
      setCards,
      setDeletedCardIds,
    ]
  )

  const onRestore = useCallback(
    (state: DeckEditorDraftState) => {
      applyState(state)
      toast.info('Restored unsaved editor changes')
    },
    [applyState]
  )

  const onDraftError = useCallback(
    (_error: unknown, context: DraftErrorContext) => {
      logger.warn('Deck editor draft operation failed', { context })
    },
    []
  )

  const draftState = useMemo<DeckEditorDraftState>(
    () => ({
      metadata: {
        title: metadata.title,
        description: metadata.description,
        language: metadata.language,
        tags: metadata.tags,
        level: metadata.level,
        visibility: metadata.visibility,
      },
      cards: flashcards.cards,
      deletedCardIds: flashcards.deletedCardIds,
    }),
    [
      metadata.title,
      metadata.description,
      metadata.language,
      metadata.tags,
      metadata.level,
      metadata.visibility,
      flashcards.cards,
      flashcards.deletedCardIds,
    ]
  )

  const { markSaved } = useDeckEditorDraft({
    ownerId: initialDeck.ownerUserId,
    deckId,
    revision: initialDeck.updatedAt,
    state: draftState,
    onRestore,
    onError: onDraftError,
  })

  const savePayload = useMemo(
    () => ({
      metadata: {
        title: metadata.title.trim(),
        description: metadata.description.trim(),
        language: metadata.language.trim(),
        tags: metadata.tags,
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
    }),
    [
      metadata.title,
      metadata.description,
      metadata.language,
      metadata.tags,
      metadata.level,
      metadata.visibility,
      flashcards.cards,
      flashcards.deletedCardIds,
    ]
  )

  const handleSaveChanges = useCallback(() => {
    if (savingRef.current) return
    if (!savePayload.metadata.title) {
      toast.error('Deck title cannot be empty')

      return
    }

    savingRef.current = true
    setIsImagePickerOpen(false)
    startTransition(async () => {
      try {
        const deckRes = await saveDeckEditorAction({
          id: deckId,
          data: savePayload,
        })

        if (!deckRes.success) {
          handleServerError(deckRes.validationMessages ?? deckRes.error)

          return
        }

        const saved = deckRes.data

        if (!Array.isArray(saved.flashcards)) {
          toast.error('Deck was saved, but cards could not be refreshed')

          return
        }
        const savedState: DeckEditorDraftState = {
          metadata: {
            title: saved.title,
            description: saved.description ?? '',
            language: saved.language,
            tags: saved.tags,
            level: saved.level ?? savePayload.metadata.level,
            visibility: saved.visibility,
          },
          cards: saved.flashcards,
          deletedCardIds: [],
        }

        markSaved(savedState, saved.updatedAt)
        applyState(savedState)
        router.refresh()
        toast.success('All changes saved successfully!')
      } catch (err: unknown) {
        handleServerError(err)
      } finally {
        savingRef.current = false
      }
    })
  }, [deckId, savePayload, markSaved, applyState, router, setIsImagePickerOpen])

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
