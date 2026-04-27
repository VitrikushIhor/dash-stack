import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
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
import { useForgotPassword } from '..'
import {
  forgotPasswordDefaultValues,
  forgotPasswordSchema,
  type TForgotPasswordSchema,
} from '../model/schema/forgot-password.schema'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()

  const form = useForm<TForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefaultValues,
  })

  function onSubmit(data: TForgotPasswordSchema) {
    forgotPasswordMutation.mutate(data.email)
  }

  if (forgotPasswordMutation.isSuccess || forgotPasswordMutation.isError) {
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
          onClick={() => navigate({ to: '/sign-in' })}
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
        <Button className='mt-2' disabled={forgotPasswordMutation.isPending}>
          Continue
          {forgotPasswordMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <ArrowRight />
          )}
        </Button>
      </form>
    </Form>
  )
}
