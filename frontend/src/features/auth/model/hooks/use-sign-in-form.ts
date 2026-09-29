'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import {
  AUTH_SESSION_EVENT_KIND,
  publishAuthSessionEvent,
} from '@/shared/lib/auth-session-events'
import { sanitizeRedirectUrl } from '@/shared/lib/utils'
import { signInAction } from '../../api/actions/sign-in.action'
import {
  type TSignInSchema,
  signInDefaultValues,
  signInSchema,
} from '../schema/sign-in.schema'

interface UseSignInFormProps {
  redirectTo?: string
}

export function useSignInForm(options?: UseSignInFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  })

  const { execute: signIn, isPending } = useAction(signInAction, {
    onSuccess: () => {
      queryClient.clear()
      publishAuthSessionEvent(AUTH_SESSION_EVENT_KIND.SIGNED_IN)
      toast.success(`Welcome back, ${form.getValues('email')}!`)

      const targetPath = sanitizeRedirectUrl(
        options?.redirectTo,
        ROUTES.vocabDecks
      )

      router.replace(targetPath)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await signIn(data)
  })

  return {
    form,
    isPending,
    onSubmit,
  }
}
