import { SignIn } from '@/views/auth'

interface SignInRouteProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignInRoute({ searchParams }: SignInRouteProps) {
  const { redirect } = await searchParams

  return <SignIn redirectTo={redirect} />
}
