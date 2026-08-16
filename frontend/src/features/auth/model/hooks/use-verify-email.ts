'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/constants/routes'
import { useAction } from '@/shared/lib/hooks/use-action'
import { verifyEmailAction } from '../../api/actions/verify-email.action'
import { VerificationStatus } from '../types/auth.types'

const REDIRECT_DELAY_MS = 3000

export function useVerifyEmail(token: string | null) {
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>(
    !token ? VerificationStatus.MISSING_TOKEN : VerificationStatus.LOADING
  )
  const [errorMessage, setErrorMessage] = useState<string>(
    !token ? 'Verification link is invalid: no token provided' : ''
  )
  const hasTriedRef = useRef<string | null>(null)

  const { execute: verifyEmail, isPending } = useAction(verifyEmailAction, {
    onSuccess: () => {
      setStatus(VerificationStatus.SUCCESS)
    },
    onError: (error) => {
      setStatus(VerificationStatus.ERROR)
      setErrorMessage(error)
    },
  })

  useEffect(() => {
    if (!token || hasTriedRef.current === token) return
    hasTriedRef.current = token

    verifyEmail({ token })
  }, [token, verifyEmail])

  useEffect(() => {
    if (status !== VerificationStatus.SUCCESS) return
    const timeoutId = setTimeout(() => {
      router.replace(ROUTES.signIn)
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }, [status, router])

  const handleContinue = () => {
    router.replace(ROUTES.signIn)
  }

  const isLoading = status === VerificationStatus.LOADING || isPending
  const isSuccess = status === VerificationStatus.SUCCESS
  const isFailed =
    status === VerificationStatus.ERROR ||
    status === VerificationStatus.MISSING_TOKEN

  return {
    status,
    isLoading,
    isSuccess,
    isFailed,
    errorMessage,
    handleContinue,
  }
}
