export interface User {
  id: string
  firstName: string
  lastName?: string
  email: string
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}
