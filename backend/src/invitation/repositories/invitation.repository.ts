import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { OrgRole } from '@prisma/client';
import { CreateInvitationData } from '../interfaces/invitation.interface';

@Injectable()
export class InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailAndOrg(email: string, orgId: string) {
    return this.prisma.membership.findFirst({
      where: {
        orgId,
        user: { email },
      },
    });
  }

  async findOrgById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });
  }

  async create(data: CreateInvitationData) {
    return this.prisma.invitation.create({
      data,
    });
  }

  async findByToken(token: string) {
    return this.prisma.invitation.findUnique({
      where: { token },
    });
  }

  async findById(id: string) {
    return this.prisma.invitation.findUnique({
      where: { id },
    });
  }

  async accept(
    invitationId: string,
    userId: string,
    orgId: string,
    role: OrgRole,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.create({
        data: {
          userId,
          orgId,
          role,
        },
      });

      await tx.invitation.update({
        where: { id: invitationId },
        data: { acceptedAt: new Date() },
      });

      return membership;
    });
  }

  async listPending(orgId: string) {
    return this.prisma.invitation.findMany({
      where: {
        orgId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.invitation.delete({
      where: { id },
    });
  }
}
