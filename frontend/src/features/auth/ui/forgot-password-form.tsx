'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { useForgotPasswordForm } from '../model/hooks/use-forgot-password-form'
import { ForgotPasswordFields } from './forgot-password-fields'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const router = useRouter()
  const { form, onSubmit, isPending, isSent } = useForgotPasswordForm()

  if (isSent) {
    return (
      <div className='space-y-4 text-center'>
        <div className='text-4xl'>📧</div>
        <h3 className='text-lg font-semibold'>Check your email</h3>
        <p className='text-muted-foreground text-sm'>
          If an account exists with that email, we've sent a password reset
          link.
        </p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => router.push('/sign-in')}
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <ForgotPasswordFields control={form.control} />
        <Button className='mt-2' disabled={isPending}>
          Continue
          {isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <ArrowRight className='h-4 w-4' />
          )}
        </Button>
      </form>
    </Form>
  )
}
