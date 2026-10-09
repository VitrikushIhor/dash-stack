import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateTaskData,
  FindAllTasksFilters,
  FindAllTasksUnpaginatedFilters,
  TaskRepositoryPort,
  UpdateTaskData,
} from '../../application/ports/task.repository.port';
import { TaskReadModel } from '../../application/read-models/task.read-model';
import { PrismaTaskMapper, PrismaTaskWithRelations } from './prisma-task.mapper';
import { OrderDirection } from '../../../common/order/order-direction';
import { MembershipRepositoryPort } from '../../application/ports/membership.repository.port';
import { paginate } from '../../../common/pagination/paginate';
import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { Prisma } from '@prisma/client';
import { InvalidTaskAttachmentsException } from '../../domain/exceptions/invalid-task-attachments.exception';
import { InvalidTaskLabelException } from '../../domain/exceptions/invalid-task-label.exception';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort, MembershipRepositoryPort {
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
    const { actorUserId, assigneeIds, checklists, ...rest } = data;
    const attachments = this.uniqueAttachments(rest.attachments ?? []);

    const createdTask = await this.prisma.$transaction(async (tx) => {
      await this.assertLabelBelongsToOrg(tx, rest.organizationId, rest.labelId);
      await this.assertNewAttachmentsAreOwned(tx, actorUserId, attachments);

      const task = await tx.task.create({
        data: {
          ...rest,
          attachments,
          assignees: assigneeIds?.length
            ? {
                connect: assigneeIds.map((id) => ({ id })),
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

      await this.bindAttachments(tx, actorUserId, task.id, attachments);
      return task;
    });

    return PrismaTaskMapper.toDomain(createdTask);
  }

  async findAll(
    organizationId: string,
    filters: FindAllTasksFilters = {},
  ): Promise<PaginatedResult<TaskReadModel>> {
    const { page, perPage } = filters;

    const paginated = await paginate<PrismaTaskWithRelations, Prisma.TaskFindManyArgs>(
      this.prisma.task,
      {
        where: this.buildWhereClause(organizationId, filters),
        include: this.taskInclude,
        orderBy: [{ createdAt: OrderDirection.desc }, { updatedAt: OrderDirection.desc }],
      },
      { page, perPage },
    );

    return {
      ...paginated,
      data: paginated.data.map((task) => PrismaTaskMapper.toDomain(task)),
    };
  }

  async findAllUnpaginated(
    organizationId: string,
    filters: FindAllTasksUnpaginatedFilters = {},
  ): Promise<TaskReadModel[]> {
    const tasks = await this.prisma.task.findMany({
      where: this.buildWhereClause(organizationId, filters),
      include: this.taskInclude,
      orderBy: [{ createdAt: OrderDirection.desc }, { updatedAt: OrderDirection.desc }],
    });

    return tasks.map((task) => PrismaTaskMapper.toDomain(task));
  }

  async findById(id: string, organizationId: string): Promise<TaskReadModel | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: this.taskInclude,
    });

    return task ? PrismaTaskMapper.toDomain(task) : null;
  }

  async update(id: string, organizationId: string, data: UpdateTaskData): Promise<TaskReadModel> {
    const { actorUserId, assigneeIds, checklists, ...rest } = data;

    const updatedTask = await this.prisma.$transaction(async (tx) => {
      await this.lockTask(tx, id, organizationId);
      const currentTask = await tx.task.findUniqueOrThrow({
        where: { id, organizationId },
        select: { attachments: true },
      });
      await this.assertLabelBelongsToOrg(tx, organizationId, rest.labelId);
      const attachments =
        rest.attachments === undefined ? undefined : this.uniqueAttachments(rest.attachments);
      const newAttachments =
        attachments?.filter((key) => !currentTask.attachments.includes(key)) ?? [];
      const removedAttachments =
        attachments === undefined
          ? []
          : currentTask.attachments.filter((key) => !attachments.includes(key));
      await this.assertNewAttachmentsAreOwned(tx, actorUserId, newAttachments);

      if (checklists !== undefined) {
        await tx.checklist.deleteMany({
          where: { taskId: id },
        });
      }

      const task = await tx.task.update({
        where: { id, organizationId },
        data: {
          ...rest,
          attachments,
          assignees: assigneeIds
            ? {
                set: assigneeIds.map((membershipId) => ({ id: membershipId })),
              }
            : undefined,

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

      await this.bindAttachments(tx, actorUserId, id, newAttachments);
      if (removedAttachments.length) {
        await tx.storedFile.updateMany({
          where: { taskId: id, key: { in: removedAttachments } },
          data: { deletionPendingAt: new Date() },
        });
      }
      return task;
    });

    return PrismaTaskMapper.toDomain(updatedTask);
  }

  async delete(id: string, organizationId: string): Promise<string[]> {
    return this.prisma.$transaction(async (tx) => {
      await this.lockTask(tx, id, organizationId);
      const files = await tx.storedFile.findMany({
        where: { taskId: id },
        select: { key: true },
      });
      await tx.storedFile.updateMany({
        where: { taskId: id },
        data: { deletionPendingAt: new Date() },
      });
      await tx.task.delete({ where: { id, organizationId } });
      return files.map((file) => file.key);
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
  ): Promise<{ count: number; keys: string[] }> {
    if (!ids.length) return { count: 0, keys: [] };

    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "tasks"
        WHERE "organizationId" = ${organizationId} AND "id" IN (${Prisma.join(ids)})
        FOR UPDATE
      `;
      const taskIds = locked.map((task) => task.id);
      if (!taskIds.length) return { count: 0, keys: [] };

      const files = await tx.storedFile.findMany({
        where: { taskId: { in: taskIds } },
        select: { key: true },
      });
      await tx.storedFile.updateMany({
        where: { taskId: { in: taskIds } },
        data: { deletionPendingAt: new Date() },
      });
      const deleted = await tx.task.deleteMany({
        where: { organizationId, id: { in: taskIds } },
      });
      return { count: deleted.count, keys: files.map((file) => file.key) };
    });
  }

  async validateMemberships(organizationId: string, membershipIds: string[]): Promise<boolean> {
    const uniqueIds = [...new Set(membershipIds)];
    const count = await this.prisma.membership.count({
      where: {
        orgId: organizationId,
        id: { in: uniqueIds },
      },
    });

    return count === uniqueIds.length;
  }

  private async lockTask(
    tx: Prisma.TransactionClient,
    id: string,
    organizationId: string,
  ): Promise<void> {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "tasks"
      WHERE "id" = ${id} AND "organizationId" = ${organizationId}
      FOR UPDATE
    `;
  }

  private async assertLabelBelongsToOrg(
    tx: Prisma.TransactionClient,
    organizationId: string,
    labelId?: string | null,
  ): Promise<void> {
    if (labelId === undefined || labelId === null) return;

    // Keep deletion behind the task write so a validated label cannot disappear before its FK insert.
    const labels = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "organization_labels"
      WHERE "id" = ${labelId} AND "organizationId" = ${organizationId}
      FOR KEY SHARE
    `;

    if (labels.length !== 1) throw new InvalidTaskLabelException();
  }

  private uniqueAttachments(attachments: string[]): string[] {
    const unique = [...new Set(attachments)];
    if (unique.length !== attachments.length) {
      throw new InvalidTaskAttachmentsException();
    }
    return unique;
  }

  private async assertNewAttachmentsAreOwned(
    tx: Prisma.TransactionClient,
    actorUserId: string,
    keys: string[],
  ): Promise<void> {
    if (!keys.length) return;

    const count = await tx.storedFile.count({
      where: {
        key: { in: keys },
        ownerUserId: actorUserId,
        taskId: null,
        deletionPendingAt: null,
        kind: 'ATTACHMENT',
      },
    });

    if (count !== keys.length) {
      throw new InvalidTaskAttachmentsException();
    }
  }

  private async bindAttachments(
    tx: Prisma.TransactionClient,
    actorUserId: string,
    taskId: string,
    keys: string[],
  ): Promise<void> {
    if (!keys.length) return;

    const result = await tx.storedFile.updateMany({
      where: {
        key: { in: keys },
        ownerUserId: actorUserId,
        taskId: null,
        deletionPendingAt: null,
        kind: 'ATTACHMENT',
      },
      data: { taskId },
    });

    if (result.count !== keys.length) {
      throw new InvalidTaskAttachmentsException();
    }
  }

  private buildWhereClause(organizationId: string, filters: FindAllTasksUnpaginatedFilters) {
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

    return {
      organizationId,
      AND: [
        search
          ? {
              OR: [
                {
                  title: { contains: search, mode: 'insensitive' as const },
                },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {},
        status?.length ? { status: { in: status } } : {},
        assigneeIds?.length ? { assignees: { some: { id: { in: assigneeIds } } } } : {},
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
    };
  }
}
