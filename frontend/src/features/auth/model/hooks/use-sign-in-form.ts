'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants/routes'
import { sanitizeRedirectUrl } from '@/shared/lib/utils'
import { signInAction } from '../mutations/auth-actions'
import {
  signInDefaultValues,
  signInSchema,
  type TSignInSchema,
} from '../schema/sign-in.schema'

interface UseSignInFormProps {
  redirectTo?: string
}

export function useSignInForm(options?: UseSignInFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  })

  function handleSubmit(data: TSignInSchema) {
    startTransition(async () => {
      try {
        await signInAction({
          email: data.email,
          password: data.password,
        })

        toast.success(`Welcome back, ${data.email}!`)

        const targetPath = sanitizeRedirectUrl(
          options?.redirectTo,
          ROUTES.createOrganization
        )
        router.replace(targetPath)
      } catch (error) {
        handleServerError(error)
      }
    })
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(handleSubmit),
  }
}
