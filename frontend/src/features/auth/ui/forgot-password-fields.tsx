import type { Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import type { TForgotPasswordSchema } from '../model/schema/forgot-password.schema'

interface ForgotPasswordFieldsProps {
  control: Control<TForgotPasswordSchema>
}

export function ForgotPasswordFields({ control }: ForgotPasswordFieldsProps) {
  return (
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
  )
}
