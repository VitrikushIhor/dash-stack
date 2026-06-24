import { OrganizationReadModel } from '../../application/read-models/organization.read-model';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PrismaOrganizationMapper } from './prisma-organization.mapper';
import {
  CreateOrganizationData,
  OrganizationRepositoryPort,
} from '../../application/ports/organization.port';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private readonly countSelect = {
    projects: true,
    memberships: true,
    calendarEvents: true,
  } as const;

  async create(
    userId: string,
    uniqueSlug: string,
    data: CreateOrganizationData,
  ): Promise<OrganizationReadModel> {
    const rawOrg = await this.prisma.organization.create({
      data: {
        ...data,
        slug: uniqueSlug,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        _count: { select: this.countSelect },
      },
    });

    return PrismaOrganizationMapper.toReadModel(rawOrg);
  }

  async findManyByUserId(userId: string): Promise<OrganizationReadModel[]> {
    const rawOrgs = await this.prisma.organization.findMany({
      where: { memberships: { some: { userId } } },
      include: {
        _count: { select: this.countSelect },
      },
    });

    return rawOrgs.map((org) => PrismaOrganizationMapper.toReadModel(org));
  }

  async findById(id: string): Promise<OrganizationReadModel | null> {
    const rawOrg = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: this.countSelect },
      },
    });

    return PrismaOrganizationMapper.toReadModel(rawOrg);
  }

  async update(
    id: string,
    data: Partial<CreateOrganizationData>,
  ): Promise<OrganizationReadModel | null> {
    const rawOrg = await this.prisma.organization.update({
      where: { id },
      data,
      include: {
        _count: { select: this.countSelect },
      },
    });

    return PrismaOrganizationMapper.toReadModel(rawOrg);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
    });
  }

  async findOrganizationMembers(orgId: string) {
    return this.prisma.membership.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findOrganizationMember(orgId: string, userId: string) {
    return this.prisma.membership.findFirst({
      where: {
        orgId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!existing;
  }
}
