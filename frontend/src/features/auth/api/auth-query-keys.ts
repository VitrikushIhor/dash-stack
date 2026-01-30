// Query keys

const AUTH = ['auth'] as const
const USER = ['user'] as const

export const authKeys = {
  all: AUTH,
  user: [...AUTH, ...USER],
}
