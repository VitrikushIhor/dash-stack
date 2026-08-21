'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { type ActionState, handleServerError } from '@/shared/api'

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void
  onError?: (error: string) => void
  successMessage?: string
}

export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionState<TOutput>>,
  options?: UseActionOptions<TOutput>
) {
  const [isPending, startTransition] = useTransition()

  const execute = (input: TInput) => {
    return new Promise<TOutput | undefined>((resolve) => {
      startTransition(async () => {
        const result = await action(input)

        if (!result.success) {
          handleServerError(
            result.validationMessages?.length
              ? result.validationMessages
              : result.error
          )
          options?.onError?.(result.error)
          resolve(undefined)
          return
        }

        if (options?.successMessage) {
          toast.success(options.successMessage)
        }

        options?.onSuccess?.(result.data)
        resolve(result.data)
      })
    })
  }

  return {
    execute,
    isPending,
  }
}
