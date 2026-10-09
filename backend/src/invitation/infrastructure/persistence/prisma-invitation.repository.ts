import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from 'nestjs-prisma';
import { OrgRole } from '../../../organization/domain/enums/org-role.enum';
import {
  InvitationRepositoryPort,
  CreateInvitationData,
  CreatedInvitation,
} from '../../application/ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../../application/read-models/pending-invitation.read-model';
import { PrismaInvitationMapper } from './prisma-invitation.mapper';
import { InvitationNoLongerValidException } from '../../domain/exceptions/invitation-invalid.exception';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findMembershipByEmailAndOrg(email: string, orgId: string): Promise<unknown | null> {
    return this.prisma.membership.findFirst({
      where: {
        orgId,
        user: { email },
      },
    });
  }

  async findPendingByEmailAndOrg(email: string, orgId: string): Promise<unknown | null> {
    return this.prisma.invitation.findFirst({
      where: {
        email,
        orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findOrgById(id: string): Promise<{ name: string } | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });
  }

  async create(data: CreateInvitationData): Promise<CreatedInvitation> {
    const token = randomBytes(32).toString('base64url');
    const invitation = await this.prisma.invitation.create({
      data: { ...data, token: this.hashToken(token) },
    });
    return { invitation: PrismaInvitationMapper.toReadModel(invitation), token };
  }

  async findByToken(token: string): Promise<PendingInvitationReadModel | null> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return null;
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { token: this.hashToken(token) },
    });
    return invitation ? PrismaInvitationMapper.toReadModel(invitation) : null;
  }

  async findById(id: string): Promise<PendingInvitationReadModel | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });
    return invitation ? PrismaInvitationMapper.toReadModel(invitation) : null;
  }

  async accept(
    invitationId: string,
    userId: string,
    userEmail: string,
    orgId: string,
    role: OrgRole,
  ): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const consumed = await tx.invitation.updateMany({
        where: {
          id: invitationId,
          email: { equals: userEmail, mode: 'insensitive' },
          orgId,
          role,
          acceptedAt: null,
          expiresAt: { gt: now },
        },
        data: { acceptedAt: now },
      });

      if (consumed.count !== 1) {
        throw new InvitationNoLongerValidException();
      }

      const existing = await tx.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
      });

      if (existing) {
        return existing;
      }

      const membership = await tx.membership.create({
        data: { userId, orgId, role },
      });

      return membership;
    });
  }

  async listPending(orgId: string): Promise<PendingInvitationReadModel[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return invitations.map(PrismaInvitationMapper.toReadModel);
  }

  async delete(id: string, orgId: string): Promise<void> {
    const deleted = await this.prisma.invitation.deleteMany({
      where: { id, orgId, acceptedAt: null },
    });

    if (deleted.count !== 1) {
      throw new InvitationNoLongerValidException();
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
