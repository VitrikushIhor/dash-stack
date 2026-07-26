import { VerifyEmail } from '@/views/auth'

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailRoute({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams

  return <VerifyEmail token={token} />
}
