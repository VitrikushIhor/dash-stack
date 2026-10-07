'use client'

import dynamic from 'next/dynamic'
import type { Deck } from '@/entities/deck'
import { useDeckSearchParams } from '../model/deck-search-params'
import { DeleteDeckModalLoading } from './delete-deck-modal-loading'

const DeleteDeckModalContent = dynamic(
  () =>
    import('./delete-deck-modal-content').then(
      (mod) => mod.DeleteDeckModalContent
    ),
  { loading: DeleteDeckModalLoading }
)

interface DeleteDeckModalProps {
  decks: Deck[]
}

export function DeleteDeckModal({ decks }: DeleteDeckModalProps) {
  const [params] = useDeckSearchParams()

  return params['delete-deck'] ? <DeleteDeckModalContent decks={decks} /> : null
}
