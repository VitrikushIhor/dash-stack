'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import { forkDeckAction } from '../server'

export function useForkDeck(deckId: string, deckTitle?: string) {
  const router = useRouter()

  const { execute, isPending } = useAction(forkDeckAction, {
    onSuccess: (data) => {
      toast.success(
        deckTitle
          ? `Forked "${deckTitle}" into your collection!`
          : 'Deck successfully cloned!'
      )
      if (data?.id) {
        router.push(ROUTES.vocabDeckEdit(data.id))
      }
    },
  })

  const handleFork = () => {
    execute({ id: deckId })
  }

  return {
    isPending,
    handleFork,
  }
}
