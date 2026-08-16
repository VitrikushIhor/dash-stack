'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus } from 'lucide-react'
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
import { PasswordInput } from '@/shared/ui/password-input'
import { useSignUpForm } from '../model/hooks/use-sign-up-form'
import { OAuthButtons } from './oauth-buttons'

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  onSuccess?: () => void
}

export function SignUpForm({
  className,
  onSuccess,
  ...props
}: SignUpFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const { form, onSubmit, isPending } = useSignUpForm({
    onSuccess: () => {
      setIsSuccess(true)
      onSuccess?.()
    },
  })

  if (isSuccess) {
    return (
      <div className='space-y-4 py-2 text-center'>
        <div className='text-4xl'>📧</div>
        <h3 className='text-lg font-semibold'>Check your email</h3>
        <p className='text-muted-foreground text-sm'>
          We&apos;ve sent a verification link to your email address.
          <br />
          Please click the link to verify your account.
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
        className={cn('grid gap-3', className)}
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
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
            <UserPlus className='h-4 w-4' />
          )}
          Create Account
        </Button>

        <OAuthButtons disabled={isPending} />
      </form>
    </Form>
  )
}
