import { z } from 'zod'
import {
  InvitationIdSchema,
  InvitationTokenSchema,
  OrganizationSlugSchema,
  SendInviteDtoSchema,
} from '@/entities/organization'

export const SendInvitationActionSchema = z.object({
  slug: OrganizationSlugSchema,
  dto: SendInviteDtoSchema,
})

export const RevokeInvitationActionSchema = z.object({
  slug: OrganizationSlugSchema,
  invitationId: InvitationIdSchema,
})

export const AcceptInvitationActionSchema = InvitationTokenSchema
