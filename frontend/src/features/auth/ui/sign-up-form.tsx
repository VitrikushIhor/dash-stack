'use client'

import { Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { useSignUpForm } from '../model/hooks/use-sign-up-form'
import { OAuthButtons } from './oauth-buttons'
import { SignUpFields } from './sign-up-fields'

export function SignUpForm({
  className,
  onSuccess,
  ...props
}: React.HTMLAttributes<HTMLFormElement> & { onSuccess?: () => void }) {
  const { form, onSubmit, isPending } = useSignUpForm({ onSuccess })

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <SignUpFields control={form.control} />

        <Button className='mt-2' disabled={isPending}>
          {isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <UserPlus className='h-4 w-4' />
          )}
          Create Account
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <OAuthButtons disabled={isPending} />
      </form>
    </Form>
  )
}
