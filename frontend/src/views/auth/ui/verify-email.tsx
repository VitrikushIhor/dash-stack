import { VerifyEmailCard } from '@/features/auth'

interface VerifyEmailProps {
  token?: string
}

export function VerifyEmail({ token }: VerifyEmailProps) {
  return <VerifyEmailCard token={token} />
}
