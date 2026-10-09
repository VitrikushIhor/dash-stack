'use client'

import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/lib'
import {
  archiveDeckAction,
  deleteDeckAction,
  publishDeckAction,
  restoreDeckAction,
  unpublishDeckAction,
} from '../server'

interface UseDeckActionsProps {
  onSuccess?: () => void
}

export function useDeckActions(props?: UseDeckActionsProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
    props?.onSuccess?.()
  }

  const { execute: executePublish, isPending: isPublishing } = useAction(
    publishDeckAction,
    {
      successMessage: 'Deck published successfully',
      onSuccess: handleSuccess,
    }
  )

  const { execute: executeUnpublish, isPending: isUnpublishing } = useAction(
    unpublishDeckAction,
    {
      successMessage: 'Deck unpublished successfully',
      onSuccess: handleSuccess,
    }
  )

  const { execute: executeArchive, isPending: isArchiving } = useAction(
    archiveDeckAction,
    {
      successMessage: 'Deck archived successfully',
      onSuccess: handleSuccess,
    }
  )

  const { execute: executeRestore, isPending: isRestoring } = useAction(
    restoreDeckAction,
    {
      successMessage: 'Deck restored successfully',
      onSuccess: handleSuccess,
    }
  )

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteDeckAction,
    {
      successMessage: 'Deck deleted successfully',
      onSuccess: handleSuccess,
    }
  )

  const isPending =
    isPublishing || isUnpublishing || isArchiving || isRestoring || isDeleting

  return {
    isPending,
    publishDeck: (id: string) => executePublish({ id }),
    unpublishDeck: (id: string) => executeUnpublish({ id }),
    archiveDeck: (id: string) => executeArchive({ id }),
    restoreDeck: (id: string) => executeRestore({ id }),
    deleteDeck: (id: string) => executeDelete({ id }),
  }
}
