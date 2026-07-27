'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import { useForgotPasswordForm } from '../model/hooks/use-forgot-password-form'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { form, onSubmit, isPending, isSent } = useForgotPasswordForm()

  if (isSent) {
    return (
      <div className='space-y-4 text-center'>
        <div className='text-4xl'>📧</div>
        <h3 className='text-lg font-semibold'>Check your email</h3>
        <p className='text-muted-foreground text-sm'>
          If an account exists with that email, we&apos;ve sent a password reset
          link.
        </p>
        <Button variant='outline' className='mt-4' asChild>
          <Link href={ROUTES.signIn}>Back to Sign In</Link>
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
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
