import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { OrgRole } from '@prisma/client';
import {
  InvitationRepositoryPort,
  CreateInvitationData,
} from '../../application/ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../../application/read-models/pending-invitation.read-model';
import { PrismaInvitationMapper } from './prisma-invitation.mapper';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findMembershipByEmailAndOrg(
    email: string,
    orgId: string,
  ): Promise<unknown | null> {
    return this.prisma.membership.findFirst({
      where: {
        orgId,
        user: { email },
      },
    });
  }

  async findPendingByEmailAndOrg(
    email: string,
    orgId: string,
  ): Promise<unknown | null> {
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

  async create(
    data: CreateInvitationData,
  ): Promise<PendingInvitationReadModel> {
    const invitation = await this.prisma.invitation.create({ data });
    return PrismaInvitationMapper.toReadModel(invitation);
  }

  async findByToken(token: string): Promise<PendingInvitationReadModel | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
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
    orgId: string,
    role: OrgRole,
  ): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
      });

      if (existing) {
        await tx.invitation.update({
          where: { id: invitationId },
          data: { acceptedAt: new Date() },
        });
        return existing;
      }

      const membership = await tx.membership.create({
        data: { userId, orgId, role },
      });

      await tx.invitation.update({
        where: { id: invitationId },
        data: { acceptedAt: new Date() },
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

  async delete(id: string): Promise<void> {
    await this.prisma.invitation.delete({ where: { id } });
  }
}
