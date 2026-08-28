'use client'

import { useAction } from '@/shared/lib'
import { submitMatchScoreAction } from '../../server'

interface UseSubmitMatchScoreProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSubmitMatchScore(props?: UseSubmitMatchScoreProps) {
  const { execute, isPending } = useAction(submitMatchScoreAction, {
    onSuccess: () => {
      props?.onSuccess?.()
    },
    onError: (error) => {
      props?.onError?.(error)
    },
  })

  const submitMatchScore = (deckId: string, durationMs: number) => {
    execute({ deckId, durationMs })
  }

  return {
    isSubmitting: isPending,
    submitMatchScore,
  }
}
