import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/config'

export default function OAuthCallbackRoute(): never {
  redirect(ROUTES.signIn)
}
