import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/shared/api'
import { verifyEmailAction } from '../../actions/auth-actions'
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
      router.replace('/sign-in')
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }, [status, router])

  const handleContinue = () => {
    router.replace('/sign-in')
  }

  return {
    status,
    errorMessage,
    handleContinue,
  }
}
