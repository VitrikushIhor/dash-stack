'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/core/alert'
import { Input } from '@/shared/ui/core/input'
import { Label } from '@/shared/ui/core/label'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'
import { type Deck } from '@/entities/deck'
import { useDeckSearchParams } from '../model/deck-search-params'
import { useDeckActions } from '../model/use-deck-actions'

const CONFIRM_WORD = 'DELETE'

interface DeleteDeckModalProps {
  decks: Deck[]
}

export function DeleteDeckModalContent({ decks }: DeleteDeckModalProps) {
  const [params, setParams] = useDeckSearchParams()
  const [value, setValue] = useState('')

  const deleteId = params['delete-deck']
  const isOpen = !!deleteId

  const selectedDeck = deleteId
    ? (decks.find((d) => d.id === deleteId) ?? null)
    : null

  const close = () => {
    setParams({ 'delete-deck': null })
    setValue('')
  }

  const { deleteDeck, isPending } = useDeckActions({
    onSuccess: close,
  })

  const handleDelete = async () => {
    if (!selectedDeck) return
    await deleteDeck(selectedDeck.id)
  }

  return (
    <UrlConfirmDialog.Root
      queryKey='delete-deck'
      enabled={isOpen}
      onClose={() => setValue('')}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isPending}
      className='max-w-md'
      confirmText={isPending ? 'Deleting...' : 'Delete'}
      destructive
      isLoading={isPending}
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete deck
        </UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description className='text-foreground'>
          Are you sure you want to delete the deck{' '}
          <strong>{selectedDeck?.title}</strong>? This action cannot be undone.
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
      <UrlConfirmDialog.Body className='space-y-4'>
        <Label className='my-4 flex flex-col items-start gap-1.5'>
          <span className='font-normal'>
            Confirm by typing "{CONFIRM_WORD}":
          </span>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
          />
        </Label>

        <Alert variant='destructive'>
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            Please be careful, this operation can not be rolled back. All
            flashcards in this deck will be deleted.
          </AlertDescription>
        </Alert>
      </UrlConfirmDialog.Body>
    </UrlConfirmDialog.Root>
  )
}
