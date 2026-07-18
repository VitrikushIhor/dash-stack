export interface User {
  id: string
  firstName: string
  lastName?: string
  email: string
  avatar?: string | null
  dob?: string | null
  bio?: string | null
  urls?: string[]
  createdAt?: string
  updatedAt?: string
}
