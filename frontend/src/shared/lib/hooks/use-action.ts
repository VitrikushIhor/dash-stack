'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [isPending, setIsPending] = useState(false)

  const optionsRef = useRef(options)
  const actionRef = useRef(action)

  useEffect(() => {
    optionsRef.current = options
    actionRef.current = action
  }, [options, action])

  const execute = useCallback(
    async (input: TInput): Promise<TOutput | undefined> => {
      setIsPending(true)

      try {
        const result = await actionRef.current(input)
        const currentOptions = optionsRef.current

        if (!result.success) {
          const errorMessage = result.error || 'An unexpected error occurred'

          handleServerError(
            result.validationMessages?.length
              ? result.validationMessages
              : errorMessage
          )
          currentOptions?.onError?.(errorMessage)

          return undefined
        }

        if (currentOptions?.successMessage) {
          toast.success(currentOptions.successMessage)
        }

        currentOptions?.onSuccess?.(result.data)

        return result.data
      } catch (err) {
        const currentOptions = optionsRef.current
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'

        handleServerError(errorMessage)
        currentOptions?.onError?.(errorMessage)

        return undefined
      } finally {
        setIsPending(false)
      }
    },
    []
  )

  return {
    execute,
    isPending,
  }
}
