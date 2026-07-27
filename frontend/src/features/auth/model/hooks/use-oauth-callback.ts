'use client'

import { useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants/routes'
import { extractOAuthToken } from '../../lib/oauth-token-extractor'
import { oauthExchangeAction } from '../mutations/auth-actions'

interface UseOAuthCallbackProps {
  code: string | null
  error: string | null
}

export function useOAuthCallback({ code, error }: UseOAuthCallbackProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const hasHandledRef = useRef(false)

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

    startTransition(async () => {
      try {
        await oauthExchangeAction(token)
        toast.success('Successfully signed in!')

        router.replace(ROUTES.createOrganization)
      } catch (err) {
        handleServerError(err)
      }
    })
  }, [code, error, router])
}
