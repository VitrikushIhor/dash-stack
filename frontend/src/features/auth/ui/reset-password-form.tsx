'use client'

import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import Link from 'next/link'
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
import { PasswordInput } from '@/shared/ui/password-input'
import { useResetPasswordForm } from '../model/hooks/use-reset-password-form'

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLFormElement> {
  token: string
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const { form, onSubmit, isPending, isSuccess } = useResetPasswordForm({
    token,
  })

  if (isSuccess) {
    return (
      <div className='flex flex-col items-center gap-4 text-center'>
        <CheckCircle2 className='h-12 w-12 text-green-500' />
        <h3 className='text-lg font-semibold'>Password Reset Complete</h3>
        <p className='text-muted-foreground text-sm'>
          Your password has been successfully reset.
        </p>
        <Button asChild>
          <Link href='/sign-in'>Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isPending}>
          {isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <KeyRound className='h-4 w-4' />
          )}
          Reset Password
        </Button>
      </form>
    </Form>
  )
}
