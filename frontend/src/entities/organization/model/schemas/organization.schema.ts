import { z } from 'zod'

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
