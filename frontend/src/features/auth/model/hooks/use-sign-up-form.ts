'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/shared/lib'
import { signUpAction } from '../../api/actions/sign-up.action'
import {
  type TSignUpSchema,
  signUpDefaultValues,
  signUpSchema,
} from '../schema/sign-up.schema'

interface UseSignUpFormProps {
  onSuccess?: () => void
}

export function useSignUpForm({ onSuccess }: UseSignUpFormProps = {}) {
  const form = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { execute: signUp, isPending } = useAction(signUpAction, {
    successMessage: 'Account created! Please check your email to verify.',
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await signUp(data)
  })

  return {
    form,
    isPending,
    onSubmit,
  }
}
