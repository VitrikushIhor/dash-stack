'use client'

import { Loader2, LogIn } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { useSignInForm } from '../model/hooks/use-sign-in-form'
import { OAuthButtons } from './oauth-buttons'
import { SignInFields } from './sign-in-fields'

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignInForm({
  className,
  redirectTo,
  ...props
}: SignInFormProps) {
  const { form, onSubmit, isPending } = useSignInForm({ redirectTo })

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <SignInFields control={form.control} />

        <Button className='mt-2' disabled={isPending}>
          {isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn className='h-4 w-4' />
          )}
          Sign in
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
