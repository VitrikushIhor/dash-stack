import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateTaskData, UpdateTaskData } from '../interfaces/task.interface';

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

  async findAll(organizationId: string) {
    return this.prisma.task.findMany({
      where: { organizationId },
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
        _count: {
          select: {
            checklists: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    const { assigneeIds, ...rest } = data;

    return this.prisma.task.update({
      where: { id, organizationId },
      data: {
        ...rest,
        assignees: assigneeIds
          ? {
              set: assigneeIds.map((id) => ({ id })),
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
}
