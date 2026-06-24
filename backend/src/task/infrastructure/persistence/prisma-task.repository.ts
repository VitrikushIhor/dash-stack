import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateTaskData,
  FindAllTasksFilters,
  TaskRepositoryPort,
  UpdateTaskData,
} from '../../application/ports/task.repository.port';
import { TaskReadModel } from '../../application/read-models/task.read-model';
import { PrismaTaskMapper } from './prisma-task.mapper';
import { MembershipRepositoryPort } from '../../application/ports/membership.repository.port';

@Injectable()
export class PrismaTaskRepository
  implements TaskRepositoryPort, MembershipRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  private readonly taskInclude = {
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
    label: true,
    checklists: {
      include: {
        items: true,
      },
    },
  } as const;

  async create(data: CreateTaskData): Promise<TaskReadModel> {
    const { assigneeIds, label, checklists, ...rest } = data;

    const createdTask = await this.prisma.task.create({
      data: {
        ...rest,
        attachments: rest.attachments ?? [],
        assignees: assigneeIds?.length
          ? {
              connect: assigneeIds.map((id) => ({ id })),
            }
          : undefined,
        label: label
          ? {
              create: {
                name: label.name,
                color: label.color ?? null,
              },
            }
          : undefined,
        checklists: checklists?.length
          ? {
              create: checklists.map((cl) => ({
                name: cl.name,
                items: {
                  create: cl.items.map((item) => ({
                    title: item.text,
                    completed: item.completed ?? false,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: this.taskInclude,
    });

    return PrismaTaskMapper.toDomain(createdTask);
  }

  async findAll(
    organizationId: string,
    filters: FindAllTasksFilters = {},
  ): Promise<TaskReadModel[]> {
    const {
      search,
      status,
      assigneeIds,
      labelNames,
      dueDateFrom,
      dueDateTo,
      startDateFrom,
      startDateTo,
    } = filters;

    const tasks = await this.prisma.task.findMany({
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
          labelNames?.length ? { label: { name: { in: labelNames } } } : {},
          dueDateFrom || dueDateTo
            ? {
                dueDate: {
                  gte: dueDateFrom,
                  lte: dueDateTo,
                },
              }
            : {},
          startDateFrom || startDateTo
            ? {
                startDate: {
                  gte: startDateFrom,
                  lte: startDateTo,
                },
              }
            : {},
        ],
      },
      include: this.taskInclude,
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
    });

    return tasks.map((task) => PrismaTaskMapper.toDomain(task));
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<TaskReadModel | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: this.taskInclude,
    });

    return task ? PrismaTaskMapper.toDomain(task) : null;
  }

  async update(
    id: string,
    organizationId: string,
    data: UpdateTaskData,
  ): Promise<TaskReadModel> {
    const { assigneeIds, label, checklists, ...rest } = data;

    const updatedTask = await this.prisma.$transaction(async (tx) => {
      if (label !== undefined) {
        await tx.taskLabel.deleteMany({
          where: { taskId: id },
        });
      }

      if (checklists !== undefined) {
        await tx.checklist.deleteMany({
          where: { taskId: id },
        });
      }

      return tx.task.update({
        where: { id, organizationId },
        data: {
          ...rest,
          assignees: assigneeIds
            ? {
                set: assigneeIds.map((membershipId) => ({ id: membershipId })),
              }
            : undefined,
          label:
            label === undefined
              ? undefined
              : label === null
                ? undefined
                : {
                    create: {
                      name: label.name,
                      color: label.color ?? null,
                    },
                  },
          checklists:
            checklists === undefined
              ? undefined
              : {
                  create: checklists.map((cl) => ({
                    name: cl.name,
                    items: {
                      create: cl.items.map((item) => ({
                        title: item.text,
                        completed: item.completed ?? false,
                      })),
                    },
                  })),
                },
        },
        include: this.taskInclude,
      });
    });

    return PrismaTaskMapper.toDomain(updatedTask);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id, organizationId },
    });
  }

  async updateMany(
    organizationId: string,
    ids: string[],
    data: Partial<Omit<UpdateTaskData, 'assigneeIds' | 'label' | 'checklists'>>,
    additionalWhere?: Record<string, unknown>,
  ): Promise<{ count: number }> {
    return this.prisma.task.updateMany({
      where: {
        id: { in: ids },
        organizationId,
        ...(additionalWhere ?? {}),
      },
      data,
    });
  }

  async deleteMany(
    organizationId: string,
    ids: string[],
  ): Promise<{ count: number }> {
    return this.prisma.task.deleteMany({
      where: {
        id: { in: ids },
        organizationId,
      },
    });
  }

  async validateMemberships(
    organizationId: string,
    membershipIds: string[],
  ): Promise<boolean> {
    const uniqueIds = [...new Set(membershipIds)];
    const count = await this.prisma.membership.count({
      where: {
        orgId: organizationId,
        id: { in: uniqueIds },
      },
    });

    return count === uniqueIds.length;
  }
}
