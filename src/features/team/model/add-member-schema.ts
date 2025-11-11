import { z } from 'zod'
import { TEAM_ROLES, USER_GENDER } from '@/entities/team'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const memberFormSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: 'Only .jpg, .jpeg, and .png formats are supported',
    }),
  gender: z.nativeEnum(USER_GENDER).refine((val) => val !== undefined, {
    message: 'Gender is required',
  }),
  position: z.nativeEnum(TEAM_ROLES).refine((val) => val !== undefined, {
    message: 'Position is required',
  }),
  first_name: z.string().min(1, { message: 'First Name is required' }),
  last_name: z.string().min(1, { message: 'Last Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
})

export type MemberForm = z.infer<typeof memberFormSchema>

export const defaultValues: Partial<MemberForm> = {
  avatar: undefined,
  first_name: '',
  last_name: '',
  email: '',
  gender: undefined,
  position: undefined,
}
