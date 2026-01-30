import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/ui/card'
import { AuthLayout, SignUpForm } from '@/features/auth'

export function SignUp() {
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  if (isSuccess) {
    return (
      <AuthLayout>
        <Card className='gap-4'>
          <CardContent className='pt-6'>
            <div className='space-y-4 text-center'>
              <div className='text-4xl'>📧</div>
              <h3 className='text-lg font-semibold'>Check your email</h3>
              <p className='text-muted-foreground text-sm'>
                We've sent a verification link to your email address.
                <br />
                Please click the link to verify your account.
              </p>
              <Button
                variant='outline'
                className='mt-4'
                onClick={() => navigate({ to: '/sign-in' })}
              >
                Back to Sign In
              </Button>
            </div>
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
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your email and password to create an account. <br />
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign In
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm onSuccess={() => setIsSuccess(true)} />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By creating an account, you agree to our{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
