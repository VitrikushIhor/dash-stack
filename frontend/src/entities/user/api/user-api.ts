import { type HttpClient, api } from '@/shared/api'
import { type UpdateUserDto } from '../model/schemas/user.schema'
import { type User } from '../model/types'

export const createUserApi = (client: HttpClient) => ({
  getMe: (): Promise<User> => {
    return client.get<User>('/me')
  },
  updateMe: (dto: UpdateUserDto): Promise<User> => {
    return client.patch<User>('/me', dto)
  },
})

export const userApi = createUserApi(api)
