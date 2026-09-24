'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import { oauthExchangeAction } from '../../api/actions/oauth-exchange.action'
import { extractOAuthToken } from '../../lib/oauth-token-extractor'

interface UseOAuthCallbackProps {
  code: string | null
  error: string | null
}

export function useOAuthCallback({ code, error }: UseOAuthCallbackProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const hasHandledRef = useRef(false)

  const { execute: exchangeToken } = useAction(oauthExchangeAction, {
    successMessage: 'Successfully signed in!',
    onSuccess: () => {
      queryClient.clear()
      router.replace(ROUTES.vocabDecks)
    },
  })

  useEffect(() => {
    if (hasHandledRef.current) return
    hasHandledRef.current = true

    if (error) {
      toast.error(`Authentication failed: ${error}`)
      router.replace(ROUTES.signIn)

      return
    }

    const token = extractOAuthToken({ code, error })

    if (!token) {
      router.replace(ROUTES.signIn)

      return
    }

    exchangeToken({ token })
  }, [code, error, router, exchangeToken])
}
