'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config'
import { acceptInviteAction } from '../api/actions/accept-invite.action'

export type AcceptInviteFlowStatus = 'loading' | 'success' | 'error'

const REDIRECT_DELAY_MS = 2000

export function useAcceptInviteFlow(token: string | null) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [status, setStatus] = useState<AcceptInviteFlowStatus>(
    token ? 'loading' : 'error'
  )
  const [errorMessage, setErrorMessage] = useState(
    !token ? 'No invitation token provided' : ''
  )
  const hasTriedRef = useRef<string | null>(null)

  const fetchInvite = useCallback(() => {
    if (!token) return

    startTransition(async () => {
      const result = await acceptInviteAction(token)
      if (!result.success) {
        setStatus('error')
        setErrorMessage(result.error ?? 'Unknown error occurred')
        return
      }
      setStatus('success')
    })
  }, [token])

  useEffect(() => {
    if (!token || hasTriedRef.current === token) return
    hasTriedRef.current = token
    fetchInvite()
  }, [token, fetchInvite])

  useEffect(() => {
    if (status !== 'success') return
    const timeoutId = setTimeout(() => {
      router.replace(ROUTES.organizations)
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }, [status, router])

  const handleContinue = () => {
    router.replace(status === 'success' ? ROUTES.organizations : ROUTES.signIn)
  }

  const handleRetry = () => {
    if (!token) return
    setStatus('loading')
    setErrorMessage('')
    fetchInvite()
  }

  return {
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isFailed: status === 'error',
    errorMessage,
    handleContinue,
    handleRetry: token ? handleRetry : undefined,
  }
}
