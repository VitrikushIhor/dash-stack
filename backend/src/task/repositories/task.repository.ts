import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTaskData, UpdateTaskData } from '../interfaces/task.interface';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskData) {
    const { assigneeIds, labels, checklists, ...rest } = data;

    return this.prisma.task.create({
      data: {
        ...rest,
        assignees: assigneeIds
          ? {
              connect: assigneeIds.map((id) => ({ id })),
            }
          : undefined,
        labels: labels
          ? {
              create: labels,
            }
          : undefined,
        checklists: checklists
          ? {
              create: checklists.map((cl) => ({
                name: cl.name,
                items: {
                  create: cl.items,
                },
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                avatar: true,
              },
            },
          },
        },
        labels: true,
        checklists: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async findAll(
    organizationId: string,
    filters: { status?: TaskStatus; assigneeId?: string } = {},
  ) {
    const { status, assigneeId } = filters;
    return this.prisma.task.findMany({
      where: {
        organizationId,
        status,
        assignees: assigneeId ? { some: { id: assigneeId } } : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                avatar: true,
              },
            },
          },
        },
        labels: true,
        checklists: {
          include: {
            items: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.task.findFirst({
      where: { id, organizationId },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        labels: true,
        checklists: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async update(id: string, organizationId: string, data: UpdateTaskData) {
    const { assigneeIds, labels, checklists, ...rest } = data;

    return this.prisma.task.update({
      where: { id, organizationId },
      data: {
        ...rest,
        assignees: assigneeIds
          ? {
              set: assigneeIds.map((id) => ({ id })),
            }
          : undefined,
        labels: labels
          ? {
              deleteMany: {},
              create: labels,
            }
          : undefined,
        checklists: checklists
          ? {
              deleteMany: {},
              create: checklists.map((cl) => ({
                name: cl.name,
                items: {
                  create: cl.items,
                },
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                avatar: true,
              },
            },
          },
        },
        labels: true,
        checklists: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.task.delete({
      where: { id, organizationId },
    });
  }

  async validateMemberships(organizationId: string, membershipIds: string[]) {
    const count = await this.prisma.membership.count({
      where: {
        orgId: organizationId,
        id: { in: membershipIds },
      },
    });
    return count === membershipIds.length;
  }
}
