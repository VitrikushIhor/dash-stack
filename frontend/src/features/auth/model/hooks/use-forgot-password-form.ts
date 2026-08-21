'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/shared/lib'
import { forgotPasswordAction } from '../../api/actions/forgot-password.action'
import {
  type TForgotPasswordSchema,
  forgotPasswordDefaultValues,
  forgotPasswordSchema,
} from '../schema/forgot-password.schema'

export function useForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false)

  const form = useForm<TForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefaultValues,
  })

  const { execute: forgotPassword, isPending } = useAction(
    forgotPasswordAction,
    {
      successMessage: 'Password reset link sent to your email!',
      onSuccess: () => {
        setIsSent(true)
      },
    }
  )

  const onSubmit = form.handleSubmit(async (data) => {
    await forgotPassword(data)
  })

  return {
    form,
    isPending,
    isSent,
    onSubmit,
  }
}
