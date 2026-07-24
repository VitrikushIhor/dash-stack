import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { resetPasswordAction } from '../../actions/auth-actions'
import {
  resetPasswordDefaultValues,
  resetPasswordSchema,
  type TResetPasswordSchema,
} from '../schema/reset-password.schema'

interface UseResetPasswordFormProps {
  token: string
}

export function useResetPasswordForm({ token }: UseResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<TResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
  })

  function handleSubmit(data: TResetPasswordSchema) {
    if (!token) return

    startTransition(async () => {
      try {
        await resetPasswordAction(token, data.password)
        setIsSuccess(true)
        toast.success('Password has been successfully reset!')
      } catch (error) {
        handleServerError(error)
      }
    })
  }

  return {
    form,
    isPending,
    isSuccess,
    onSubmit: form.handleSubmit(handleSubmit),
  }
}
