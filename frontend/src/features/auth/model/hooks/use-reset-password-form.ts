'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/shared/lib'
import { resetPasswordAction } from '../../api/actions/reset-password.action'
import {
  type TResetPasswordSchema,
  resetPasswordDefaultValues,
  resetPasswordSchema,
} from '../schema/reset-password.schema'

interface UseResetPasswordFormProps {
  token: string
}

export function useResetPasswordForm({ token }: UseResetPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<TResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
  })

  const { execute: resetPassword, isPending } = useAction(resetPasswordAction, {
    successMessage: 'Password has been successfully reset!',
    onSuccess: () => {
      setIsSuccess(true)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return
    await resetPassword({
      ...data,
      token,
    })
  })

  return {
    form,
    isPending,
    isSuccess,
    onSubmit,
  }
}
