import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { signUpAction } from '../../actions/auth-actions'
import {
  signUpDefaultValues,
  signUpSchema,
  type TSignUpSchema,
} from '../schema/sign-up.schema'

interface UseSignUpFormProps {
  onSuccess?: () => void
}

export function useSignUpForm({ onSuccess }: UseSignUpFormProps = {}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  })

  function handleSubmit(data: TSignUpSchema) {
    startTransition(async () => {
      try {
        await signUpAction({
          email: data.email,
          password: data.password,
        })
        toast.success('Account created! Please check your email to verify.')
        onSuccess?.()
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
