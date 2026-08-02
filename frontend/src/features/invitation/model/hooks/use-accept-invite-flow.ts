'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants/routes'
import { useAcceptInvite } from '../mutations/use-accept-invite'
import { AcceptInviteStatus } from '../types/accept-invite.types'

const REDIRECT_DELAY_MS = 2000

export function useAcceptInviteFlow(token: string | null) {
  const router = useRouter()
  const { mutate, isPending, isSuccess, isError, error } = useAcceptInvite()
  const hasTriedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || hasTriedRef.current === token) return
    hasTriedRef.current = token
    mutate(token)
  }, [token, mutate])

  useEffect(() => {
    if (!isSuccess) return
    const timeoutId = setTimeout(() => {
      router.replace(ROUTES.organizations)
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }, [isSuccess, router])

  const status: AcceptInviteStatus = !token
    ? AcceptInviteStatus.MISSING_TOKEN
    : isPending
      ? AcceptInviteStatus.LOADING
      : isSuccess
        ? AcceptInviteStatus.SUCCESS
        : isError
          ? AcceptInviteStatus.ERROR
          : AcceptInviteStatus.LOADING

  const handleContinue = () => {
    router.replace(isSuccess ? ROUTES.organizations : ROUTES.signIn)
  }

  const handleRetry = () => {
    if (token) {
      mutate(token)
    }
  }

  return {
    status,
    isLoading: status === AcceptInviteStatus.LOADING,
    isSuccess,
    isFailed:
      status === AcceptInviteStatus.ERROR ||
      status === AcceptInviteStatus.MISSING_TOKEN,
    errorMessage: error
      ? getErrorMessage(error)
      : !token
        ? 'No invitation token provided'
        : '',
    handleContinue,
    handleRetry: token ? handleRetry : undefined,
  }
}
