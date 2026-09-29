import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateStoredFileData,
  ReadableAttachment,
  StoredFileRepositoryPort,
} from '../../application/ports/stored-file.repository.port';

@Injectable()
export class PrismaStoredFileRepository implements StoredFileRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStoredFileData): Promise<void> {
    await this.prisma.storedFile.create({ data });
  }

  async findKeysByTask(taskId: string, keys: string[]): Promise<string[]> {
    if (!keys.length) return [];

    const files = await this.prisma.storedFile.findMany({
      where: { taskId, key: { in: keys } },
      select: { key: true },
    });
    return files.map((file) => file.key);
  }

  findReadableAttachment(key: string, userId: string): Promise<ReadableAttachment | null> {
    return this.prisma.storedFile.findFirst({
      where: {
        key,
        kind: 'ATTACHMENT',
        deletionPendingAt: null,
        OR: [
          { taskId: null, ownerUserId: userId },
          { task: { organization: { memberships: { some: { userId } } } } },
        ],
      },
      select: { key: true, size: true },
    });
  }

  async markAbandonedAttachmentsPending(before: Date, limit: number): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const files = await tx.storedFile.findMany({
        where: {
          kind: 'ATTACHMENT',
          taskId: null,
          deletionPendingAt: null,
          createdAt: { lte: before },
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: limit,
        select: { key: true },
      });
      if (!files.length) return 0;

      const updated = await tx.storedFile.updateMany({
        where: {
          key: { in: files.map((file) => file.key) },
          kind: 'ATTACHMENT',
          taskId: null,
          deletionPendingAt: null,
          createdAt: { lte: before },
        },
        data: { deletionPendingAt: new Date() },
      });
      return updated.count;
    });
  }

  async findPendingDeletionKeys(before: Date, limit: number): Promise<string[]> {
    const files = await this.prisma.storedFile.findMany({
      where: { deletionPendingAt: { lte: before } },
      orderBy: [{ deletionPendingAt: 'asc' }, { id: 'asc' }],
      take: limit,
      select: { key: true },
    });
    return files.map((file) => file.key);
  }

  async deleteByKeys(keys: string[]): Promise<void> {
    if (!keys.length) return;
    await this.prisma.storedFile.deleteMany({
      where: { key: { in: keys }, deletionPendingAt: { not: null } },
    });
  }
}
