import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Github, Linkedin, Loader2, LogIn } from 'lucide-react'
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
import { useLogin } from '../api'
import {
  signInDefaultValues,
  signInSchema,
  type TSignInSchema,
} from '../model/schema/sing-in.schema'

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignInForm({
  className,
  redirectTo,
  ...props
}: SignInFormProps) {
  const loginMutation = useLogin({ redirectTo })

  const form = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  })

  function onSubmit(data: TSignInSchema) {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    })
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
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn />
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

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={loginMutation.isPending}
          >
            <Github className='h-4 w-4' />
            GitHub
          </Button>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={loginMutation.isPending}
          >
            <Linkedin className='h-4 w-4' /> Linkedin
          </Button>
        </div>
      </form>
    </Form>
  )
}
