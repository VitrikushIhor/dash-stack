import type { Control } from 'react-hook-form'
import Link from 'next/link'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import { PasswordInput } from '@/shared/ui/password-input'
import type { TSignInSchema } from '../model/schema/sign-in.schema'

interface SignInFieldsProps {
  control: Control<TSignInSchema>
}

export function SignInFields({ control }: SignInFieldsProps) {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
    </>
  )
}
