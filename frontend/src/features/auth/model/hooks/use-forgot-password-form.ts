import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { forgotPasswordAction } from '../../actions/auth-actions'
import {
  forgotPasswordDefaultValues,
  forgotPasswordSchema,
  type TForgotPasswordSchema,
} from '../schema/forgot-password.schema'

export function useForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isSent, setIsSent] = useState(false)

  const form = useForm<TForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefaultValues,
  })

  function handleSubmit(data: TForgotPasswordSchema) {
    startTransition(async () => {
      try {
        await forgotPasswordAction(data.email)
        setIsSent(true)
        toast.success('Password reset link sent to your email!')
      } catch (error) {
        handleServerError(error)
      }
    })
  }

  return {
    form,
    isPending,
    isSent,
    onSubmit: form.handleSubmit(handleSubmit),
  }
}
