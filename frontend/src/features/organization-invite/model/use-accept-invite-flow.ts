'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import { acceptInviteAction } from '../api/actions/accept-invite.action'

export type AcceptInviteFlowStatus = 'loading' | 'success' | 'error'

const REDIRECT_DELAY_MS = 2000

export function useAcceptInviteFlow(token: string | null) {
  const router = useRouter()
  const [status, setStatus] = useState<AcceptInviteFlowStatus>(
    token ? 'loading' : 'error'
  )

  const [errorMessage, setErrorMessage] = useState(
    !token ? 'No invitation token provided' : ''
  )

  const hasTriedRef = useRef<string | null>(null)
  const { execute, isPending } = useAction(acceptInviteAction, {
    onSuccess: () => setStatus('success'),
    onError: (message) => {
      setStatus('error')
      setErrorMessage(message || 'Unknown error occurred')
    },
  })

  const fetchInvite = useCallback(() => {
    if (!token) return

    void execute(token)
  }, [execute, token])

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
    isLoading: status === 'loading' || isPending,
    isSuccess: status === 'success',
    isFailed: status === 'error',
    errorMessage,
    handleContinue,
    handleRetry: token ? handleRetry : undefined,
  }
}
