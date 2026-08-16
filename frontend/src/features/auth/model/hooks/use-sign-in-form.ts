'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { useAction } from '@/shared/lib'
import { sanitizeRedirectUrl } from '@/shared/lib/utils'
import { signInAction } from '../../api/actions/sign-in.action'
import {
  signInDefaultValues,
  signInSchema,
  type TSignInSchema,
} from '../schema/sign-in.schema'

interface UseSignInFormProps {
  redirectTo?: string
}

export function useSignInForm(options?: UseSignInFormProps) {
  const router = useRouter()

  const form = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  })

  const { execute: signIn, isPending } = useAction(signInAction, {
    onSuccess: () => {
      toast.success(`Welcome back, ${form.getValues('email')}!`)

      const targetPath = sanitizeRedirectUrl(
        options?.redirectTo,
        ROUTES.organizations
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
