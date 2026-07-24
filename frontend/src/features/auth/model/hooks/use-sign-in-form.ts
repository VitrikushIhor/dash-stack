import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { userApi } from '@/entities/user/api/user-api'
import { signInAction } from '../../actions/auth-actions'
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

        let memberships: { organization: { id: string } }[] | null = null
        try {
          memberships = await userApi.getMyMemberships()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch memberships during login:', err)
        }

        if (memberships !== null && memberships.length === 0) {
          router.replace('/create-organization')
          return
        }

        const targetPath = options?.redirectTo || '/dashboard'
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
