import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { PasswordInput } from '@/shared/ui/components/password-input'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/components/ui/form'
import { Input } from '@/shared/ui/components/ui/input'
import { useSignup } from '../api'
import {
  signUpDefaultValues,
  signUpSchema,
  type TSignUpSchema,
} from '../model/schema/sing-up.schema'
import { OAuthButtons } from './oauth-buttons'

export function SignUpForm({
  className,
  onSuccess,
  ...props
}: React.HTMLAttributes<HTMLFormElement> & { onSuccess?: () => void }) {
  const signupMutation = useSignup()

  const form = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  })

  function onSubmit(data: TSignUpSchema) {
    signupMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => onSuccess?.(),
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
        <Button className='mt-2' disabled={signupMutation.isPending}>
          {signupMutation.isPending ? (
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

        <OAuthButtons disabled={signupMutation.isPending} />
      </form>
    </Form>
  )
}
