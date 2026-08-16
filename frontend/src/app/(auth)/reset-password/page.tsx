import { ResetPassword } from '@/views/auth'

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordRoute({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams

  return <ResetPassword token={token} />
}
