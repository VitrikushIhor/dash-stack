'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/core/alert'
import { Input } from '@/shared/ui/core/input'
import { Label } from '@/shared/ui/core/label'
import { type Deck } from '@/entities/deck'
import { useDeckSearchParams } from '../model/deck-search-params'
import { useDeckActions } from '../model/use-deck-actions'

const CONFIRM_WORD = 'DELETE'

interface DeleteDeckModalProps {
  decks: Deck[]
}

export function DeleteDeckModal({ decks }: DeleteDeckModalProps) {
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
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isPending}
      className='max-w-md'
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete deck
        </span>
      }
      desc={
        <div className='text-foreground space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the deck{' '}
            <strong>{selectedDeck?.title}</strong>
            ?
            <br />
            This action cannot be undone.
          </p>

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
        </div>
      }
      confirmText={isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
