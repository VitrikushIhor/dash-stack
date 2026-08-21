import { PendingInvitationReadModel } from '../../application/read-models/pending-invitation.read-model';
import { OrgRole as PrismaOrgRole } from '@prisma/client';
import { PrismaOrgRoleMapper } from '../../../organization/infrastructure/persistence/mappers/org-role.mapper';

interface PrismaInvitationPayload {
  id: string;
  email: string;
  role: PrismaOrgRole;
  orgId: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export class PrismaInvitationMapper {
  static toReadModel(payload: PrismaInvitationPayload): PendingInvitationReadModel {
    return {
      id: payload.id,
      email: payload.email,
      role: PrismaOrgRoleMapper.toDomain(payload.role),
      orgId: payload.orgId,
      invitedBy: payload.invitedBy,
      token: payload.token,
      expiresAt: payload.expiresAt,
      acceptedAt: payload.acceptedAt,
      createdAt: payload.createdAt,
    };
  }
}
