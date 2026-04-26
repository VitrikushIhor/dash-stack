import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTaskData, UpdateTaskData } from '../interfaces/task.interface';
import { TaskStatus } from '../enums/task-status.enum';

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
    filters: {
      search?: string;
      status?: TaskStatus[];
      assigneeIds?: string[];
      labelNames?: string[];
      deadlineFrom?: string;
      deadlineTo?: string;
    } = {},
  ) {
    const {
      search,
      status,
      assigneeIds,
      labelNames,
      deadlineFrom,
      deadlineTo,
    } = filters;

    return this.prisma.task.findMany({
      where: {
        organizationId,
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          status?.length ? { status: { in: status } } : {},
          assigneeIds?.length
            ? { assignees: { some: { id: { in: assigneeIds } } } }
            : {},
          labelNames?.length
            ? { labels: { some: { name: { in: labelNames } } } }
            : {},
          deadlineFrom || deadlineTo
            ? {
                deadline: {
                  gte: deadlineFrom ? new Date(deadlineFrom) : undefined,
                  lte: deadlineTo ? new Date(deadlineTo) : undefined,
                },
              }
            : {},
        ],
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

  async updateMany(
    organizationId: string,
    ids: string[],
    data: Partial<
      Omit<UpdateTaskData, 'assigneeIds' | 'labels' | 'checklists'>
    >,
  ) {
    return this.prisma.task.updateMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      data,
    });
  }

  async deleteMany(organizationId: string, ids: string[]) {
    return this.prisma.task.deleteMany({
      where: {
        id: { in: ids },
        organizationId,
      },
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
