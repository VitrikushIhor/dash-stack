'use client'

import { useAction } from '@/shared/lib'
import { useCurrentUser } from '@/entities/user'
import { submitMatchScoreAction } from '../../server'

interface UseSubmitMatchScoreProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSubmitMatchScore(props?: UseSubmitMatchScoreProps) {
  const { data: user } = useCurrentUser()
  const { execute, isPending } = useAction(submitMatchScoreAction, {
    onSuccess: () => {
      props?.onSuccess?.()
    },
    onError: (error) => {
      props?.onError?.(error)
    },
  })

  const submitMatchScore = (deckId: string, durationMs: number) => {
    if (user === null) return

    return execute({ deckId, durationMs })
  }

  return {
    isSubmitting: isPending,
    submitMatchScore,
  }
}
