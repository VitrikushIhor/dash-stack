import { z } from 'zod'
import { OrgRole } from '@/shared/model'

export const BaseOrgSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  logoFile: z
    .custom<File>((v) => v instanceof File)
    .nullable()
    .optional(),
})

export const OrganizationIdSchema = z.string().cuid('Invalid organization ID')
export const OrganizationUserIdSchema = z.string().cuid('Invalid user ID')
export const OrganizationSlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  )

export const UpdateOrganizationDtoSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).nullable().optional(),
  logo: z.string().url().nullable().optional(),
})

export const CreateOrganizationDtoSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  logo: z.string().url().optional(),
})

export const InvitationTokenSchema = z.string().min(1, 'Token is required')
export const InvitationIdSchema = z.string().cuid('Invalid invitation ID')

export const SendInviteDtoSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole),
})
