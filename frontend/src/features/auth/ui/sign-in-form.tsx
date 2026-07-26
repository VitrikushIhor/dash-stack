'use client'

import { Loader2, LogIn } from 'lucide-react'
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
import { Input } from '@/shared/ui/core/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { useSignInForm } from '../model/hooks/use-sign-in-form'
import { OAuthButtons } from './oauth-buttons'

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
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                href='/forgot-password'
                className='text-muted-foreground inset-e-0 absolute -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />

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
