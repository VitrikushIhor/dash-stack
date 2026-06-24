import { PendingInvitationReadModel } from '../../application/read-models/pending-invitation.read-model';

interface PrismaInvitationPayload {
  id: string;
  email: string;
  role: string;
  orgId: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export class PrismaInvitationMapper {
  static toReadModel(
    payload: PrismaInvitationPayload,
  ): PendingInvitationReadModel {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role as PendingInvitationReadModel['role'],
      orgId: payload.orgId,
      invitedBy: payload.invitedBy,
      token: payload.token,
      expiresAt: payload.expiresAt,
      acceptedAt: payload.acceptedAt,
      createdAt: payload.createdAt,
    };
  }
}
