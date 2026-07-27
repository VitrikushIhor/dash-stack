'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants/routes'
import { verifyEmailAction } from '../mutations/auth-actions'
import { VerificationStatus } from '../types/auth.types'

const REDIRECT_DELAY_MS = 3000

export function useVerifyEmail(token: string | null) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [status, setStatus] = useState<VerificationStatus>(
    !token ? VerificationStatus.MISSING_TOKEN : VerificationStatus.LOADING
  )
  const [errorMessage, setErrorMessage] = useState<string>(
    !token ? 'Verification link is invalid: no token provided' : ''
  )
  const hasTriedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || hasTriedRef.current === token) return
    hasTriedRef.current = token

    startTransition(async () => {
      try {
        await verifyEmailAction(token)
        setStatus(VerificationStatus.SUCCESS)
      } catch (error) {
        setStatus(VerificationStatus.ERROR)
        setErrorMessage(getErrorMessage(error))
      }
    })
  }, [token])

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

  const isLoading = status === VerificationStatus.LOADING
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
