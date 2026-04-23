import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Organization, OrgRole } from '@prisma/client';
import {
  CreateOrganizationData,
  UpdateOrganizationData,
} from '../interfaces/organization.interface';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: CreateOrganizationData,
  ): Promise<Organization> {
    const slug = await this.generateUniqueSlug(data.name);
    return this.prisma.organization.create({
      data: {
        ...data,
        slug,
        memberships: {
          create: {
            userId,
            role: OrgRole.OWNER,
          },
        },
      },
      include: {
        memberships: {
          where: { userId },
          select: { role: true, id: true },
        },
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            projects: true,
            memberships: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        memberships: {
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
        },
      },
    });
  }

  update(id: string, data: UpdateOrganizationData) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async generateUniqueSlug(name: string): Promise<string> {
    const slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug: uniqueSlug },
      });
      if (!existing) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}
