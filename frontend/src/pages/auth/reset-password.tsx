import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, CheckCircle2, KeyRound } from 'lucide-react'
import { PasswordInput } from '@/shared/ui/components/password-input'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/components/ui/form'
import { AuthLayout, useResetPassword } from '@/features/auth'
import {
  resetPasswordDefaultValues,
  resetPasswordSchema,
  type TResetPasswordSchema,
} from '@/features/auth/model/schema/reset-password.schema'

export function ResetPassword() {
  const searchParams = useSearch({ strict: false }) as { token?: string }
  const token = searchParams.token
  const navigate = useNavigate()
  const resetMutation = useResetPassword()

  const form = useForm<TResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
  })

  function onSubmit(data: TResetPasswordSchema) {
    if (!token) return
    resetMutation.mutate({ token, password: data.password })
  }

  if (!token) {
    return (
      <AuthLayout>
        <Card className='gap-4'>
          <CardHeader className='text-center'>
            <CardTitle className='text-lg tracking-tight'>
              Invalid Link
            </CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Button
              variant='outline'
              onClick={() => navigate({ to: '/forgot-password' })}
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (resetMutation.isSuccess) {
    return (
      <AuthLayout>
        <Card className='gap-4'>
          <CardHeader className='text-center'>
            <CardTitle className='text-lg tracking-tight'>
              Password Reset Complete
            </CardTitle>
            <CardDescription>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <CheckCircle2 className='h-12 w-12 text-green-500' />
            <Button onClick={() => navigate({ to: '/sign-in' })}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Reset Password
          </CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3'>
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
              <Button className='mt-2' disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <KeyRound className='h-4 w-4' />
                )}
                Reset Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
