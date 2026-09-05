'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useAction } from '@/shared/lib'
import { useCurrentUser } from '@/entities/user'
import { vocabKeys } from '@/entities/vocab'
import { submitProgressAction } from '../../server'

interface UseSubmitProgressProps {
  onSuccess?: () => void
}

export function useSubmitProgress(props?: UseSubmitProgressProps) {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  const { execute, isPending } = useAction(submitProgressAction, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabKeys.dueReviews() })
      props?.onSuccess?.()
    },
  })

  return {
    isSubmitting: isPending,
    submitProgress: (
      deckId: string,
      results: { flashcardId: string; isCorrect: boolean }[]
    ) => {
      if (user === null) return

      return execute({ deckId, results })
    },
  }
}
