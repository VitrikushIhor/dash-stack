import type { Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { PasswordInput } from '@/shared/ui/password-input'
import type { TResetPasswordSchema } from '../model/schema/reset-password.schema'

interface ResetPasswordFieldsProps {
  control: Control<TResetPasswordSchema>
}

export function ResetPasswordFields({ control }: ResetPasswordFieldsProps) {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
    </>
  )
}
