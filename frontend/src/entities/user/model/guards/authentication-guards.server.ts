'use server'

import { unauthorized } from 'next/navigation'
import { getCurrentUser } from '../../api/queries/get-current-user.server'
import { type User } from '../../model/types'

export async function requireAuthenticatedUser(): Promise<User> {
  const { data: user, error, statusCode } = await getCurrentUser()

  if (statusCode === 401) {
    unauthorized()
  }

  if (user) {
    return user
  }

  throw new Error(error ?? 'Failed to load the current user')
}
