import { api } from '@/shared/api'
import { type UserMembership } from '@/entities/organization'
import { type User } from '../model/types'

export const userApi = {
  getMe: (): Promise<User> => {
    return api.get<User>('/me')
  },
  getMyMemberships: () => api.get<UserMembership[]>('/me/memberships'),
}
