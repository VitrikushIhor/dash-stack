import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { PrismaOrganizationRepository } from '../../../organization/infrastructure/persistence/prisma-organization.repository';
import { PendingFileCleanupService } from '../../../storage/infrastructure/maintenance/pending-file-cleanup.service';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaService } from 'nestjs-prisma';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { InvalidTaskAttachmentsException } from '../../domain/exceptions/invalid-task-attachments.exception';
import { PrismaTaskRepository } from '../../infrastructure/persistence/prisma-task.repository';
import { PrismaStoredFileRepository } from '../../../storage/infrastructure/persistence/prisma-stored-file.repository';
import { StorageService } from '../../../storage/storage.service';
import { IStorageProvider } from '../../../storage/interfaces/storage.interface';
import { TaskFileStorageAdapter } from '../../infrastructure/storage/task-file-storage.adapter';
import { FindTaskByIdUseCase } from '../../application/use-cases/find-task-by-id.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { DeleteManyTasksUseCase } from '../../application/use-cases/delete-many-tasks.use-case';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for task integration tests');

describe('Task attachment ownership PostgreSQL', () => {
  let database: IsolatedPostgres;
  let prisma: PrismaService;
  let tasks: PrismaTaskRepository;
  let userId: string;
  let otherUserId: string;
  let orgId: string;
  let key: string;

  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    prisma = database.prisma;
    tasks = new PrismaTaskRepository(prisma);
  });

  beforeEach(async () => {
    const suffix = randomUUID();
    const users = await Promise.all([
      prisma.user.create({ data: { email: `attachment-owner-${suffix}@example.test` } }),
      prisma.user.create({ data: { email: `attachment-other-${suffix}@example.test` } }),
    ]);
    userId = users[0].id;
    otherUserId = users[1].id;
    const organization = await prisma.organization.create({
      data: { name: 'Attachment ownership', slug: `attachment-ownership-${suffix}` },
    });
    orgId = organization.id;
    key = `files/attachment-${suffix}.pdf`;
    await prisma.storedFile.create({
      data: {
        key,
        ownerUserId: userId,
        kind: 'ATTACHMENT',
        size: 8,
        mimeType: 'application/pdf',
      },
    });
  });

  afterEach(async () => {
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
  });

  afterAll(async () => {
    await database.close();
  });

  it('should_keep_revoked_member_attachment_inaccessible_after_organization_deletion_and_cleanup', async () => {
    const files = new PrismaStoredFileRepository(prisma);
    const membership = await prisma.membership.create({ data: { userId, orgId } });
    await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Organization attachment',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });
    expect(await files.findReadableAttachment(key, userId)).not.toBeNull();
    await prisma.membership.delete({ where: { id: membership.id } });
    expect(await files.findReadableAttachment(key, userId)).toBeNull();

    await new PrismaOrganizationRepository(prisma).delete(orgId);

    expect(await files.findReadableAttachment(key, userId)).toBeNull();
    const orphan = await prisma.storedFile.findUniqueOrThrow({ where: { key } });
    expect(orphan.taskId).toBeNull();
    expect(orphan.deletionPendingAt).not.toBeNull();
    const nextOrg = await prisma.organization.create({
      data: {
        name: 'New organization',
        slug: `new-attachment-${randomUUID()}`,
      },
    });
    orgId = nextOrg.id;
    await expect(
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Reused attachment',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ).rejects.toThrow(InvalidTaskAttachmentsException);
    const removed: string[] = [];
    const provider: IStorageProvider = {
      upload: async () => {
        throw new Error('Unexpected upload');
      },
      delete: async (fileKey) => {
        removed.push(fileKey);
      },
      read: async () => Buffer.alloc(0),
      getPublicUrl: () => '',
    };
    const cleanup = new PendingFileCleanupService(new StorageService(provider, files), files);
    await expect(cleanup.run(new Date(), 100)).resolves.toEqual({
      attempted: 1,
      deleted: 1,
      failed: 0,
    });
    expect(removed).toEqual([key]);
    expect(await prisma.storedFile.findUnique({ where: { key } })).toBeNull();
  });

  it('should_rollback_attachment_quarantine_when_organization_deletion_fails', async () => {
    const files = new PrismaStoredFileRepository(prisma);
    await prisma.membership.create({ data: { userId, orgId } });
    const task = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Rollback attachment',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });
    await prisma.$executeRaw`CREATE TABLE "organization_delete_guard" (
      "orgId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT
    )`;
    try {
      await prisma.$executeRaw`INSERT INTO "organization_delete_guard" ("orgId") VALUES (${orgId})`;
      await expect(new PrismaOrganizationRepository(prisma).delete(orgId)).rejects.toThrow();
      const file = await prisma.storedFile.findUniqueOrThrow({ where: { key } });
      expect(file.taskId).toBe(task.id);
      expect(file.deletionPendingAt).toBeNull();
      expect(await files.findReadableAttachment(key, userId)).not.toBeNull();
    } finally {
      await prisma.$executeRaw`DROP TABLE "organization_delete_guard"`;
    }
  });

  it('should_quarantine_only_old_unbound_attachments', async () => {
    const files = new PrismaStoredFileRepository(prisma);
    const stale = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await prisma.storedFile.update({ where: { key }, data: { createdAt: stale } });
    const freshKey = `files/fresh-${randomUUID()}.pdf`;
    const imageKey = `images/old-${randomUUID()}.webp`;
    const boundKey = `files/bound-${randomUUID()}.pdf`;
    const task = await prisma.task.create({
      data: { title: 'Bound file', organizationId: orgId },
    });
    await prisma.storedFile.createMany({
      data: [
        {
          key: freshKey,
          ownerUserId: userId,
          kind: 'ATTACHMENT',
          size: 1,
          mimeType: 'application/pdf',
        },
        {
          key: imageKey,
          ownerUserId: userId,
          kind: 'IMAGE',
          size: 1,
          mimeType: 'image/webp',
          createdAt: stale,
        },
        {
          key: boundKey,
          ownerUserId: userId,
          kind: 'ATTACHMENT',
          size: 1,
          mimeType: 'application/pdf',
          taskId: task.id,
          createdAt: stale,
        },
      ],
    });

    await expect(
      files.markAbandonedAttachmentsPending(new Date(Date.now() - 24 * 60 * 60 * 1000), 100),
    ).resolves.toBe(1);
    expect(
      (await prisma.storedFile.findUniqueOrThrow({ where: { key } })).deletionPendingAt,
    ).not.toBeNull();
    for (const activeKey of [freshKey, imageKey, boundKey]) {
      expect(
        (await prisma.storedFile.findUniqueOrThrow({ where: { key: activeKey } }))
          .deletionPendingAt,
      ).toBeNull();
    }
  });

  it('should_allow_only_owner_for_unbound_file_and_active_org_members_for_bound_file', async () => {
    const files = new PrismaStoredFileRepository(prisma);
    expect(await files.findReadableAttachment(key, userId)).toMatchObject({ key, size: 8 });
    expect(await files.findReadableAttachment(key, otherUserId)).toBeNull();

    const task = await prisma.task.create({
      data: { title: 'Attachment read access', organizationId: orgId },
    });
    await prisma.storedFile.update({ where: { key }, data: { taskId: task.id } });
    expect(await files.findReadableAttachment(key, userId)).toBeNull();

    const membership = await prisma.membership.create({
      data: { userId: otherUserId, orgId },
    });
    expect(await files.findReadableAttachment(key, otherUserId)).toMatchObject({ key, size: 8 });

    await prisma.membership.delete({ where: { id: membership.id } });
    expect(await files.findReadableAttachment(key, otherUserId)).toBeNull();

    await prisma.storedFile.update({ where: { key }, data: { deletionPendingAt: new Date() } });
    expect(await files.findReadableAttachment(key, userId)).toBeNull();
  });

  it('should_bind_one_owner_task_when_two_tasks_claim_the_same_key', async () => {
    const outcomes = await Promise.allSettled([
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'First claimant',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Second claimant',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ]);

    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    const file = await prisma.storedFile.findUniqueOrThrow({ where: { key } });
    const storedTasks = await prisma.task.findMany({ where: { organizationId: orgId } });
    expect(storedTasks).toHaveLength(1);
    expect(file.taskId).toBe(storedTasks[0].id);
  });

  it('should_reject_foreign_owner_and_image_keys_before_creating_task', async () => {
    await expect(
      tasks.create({
        actorUserId: otherUserId,
        organizationId: orgId,
        title: 'Foreign owner',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ).rejects.toThrow(InvalidTaskAttachmentsException);
    await prisma.storedFile.update({ where: { key }, data: { kind: 'IMAGE' } });
    await expect(
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Image as attachment',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ).rejects.toThrow(InvalidTaskAttachmentsException);
    expect(await prisma.task.count({ where: { organizationId: orgId } })).toBe(0);
  });

  it('should_delete_only_tracked_task_files_after_bulk_task_delete', async () => {
    const created = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Bulk tracked',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });
    await prisma.task.create({
      data: {
        title: 'Legacy untracked',
        organizationId: orgId,
        attachments: ['files/untracked-legacy.pdf'],
      },
    });
    const deletedKeys: string[] = [];
    const provider: IStorageProvider = {
      upload: async () => {
        throw new Error('unexpected upload');
      },
      delete: async (fileKey) => {
        deletedKeys.push(fileKey);
      },
      read: async () => Buffer.alloc(0),
      getPublicUrl: () => '',
    };
    const files = new PrismaStoredFileRepository(prisma);
    const storage = new TaskFileStorageAdapter(new StorageService(provider, files), files);
    const useCase = new DeleteManyTasksUseCase(tasks, storage);
    const ids = (await prisma.task.findMany({ where: { organizationId: orgId } })).map(
      (task) => task.id,
    );

    await expect(useCase.execute(orgId, ids)).resolves.toEqual({ count: 2 });
    expect(deletedKeys).toEqual([key]);
    expect(await prisma.storedFile.findUnique({ where: { key } })).toBeNull();
    expect(await prisma.task.count({ where: { organizationId: orgId } })).toBe(0);
    expect(ids).toContain(created.id);
  });

  it('should_not_restore_a_pending_key_when_parallel_updates_race', async () => {
    const created = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Parallel update',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });

    await Promise.allSettled([
      tasks.update(created.id, orgId, { actorUserId: userId, attachments: [] }),
      tasks.update(created.id, orgId, { actorUserId: userId, attachments: [key] }),
    ]);

    expect(await prisma.task.findUnique({ where: { id: created.id } })).toMatchObject({
      attachments: [],
    });
    expect(await prisma.storedFile.findUnique({ where: { key } })).toMatchObject({
      deletionPendingAt: expect.any(Date),
    });
  });

  it('should_keep_removed_file_pending_when_storage_delete_fails_after_update', async () => {
    const created = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Remove attachment',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });
    await tasks.update(created.id, orgId, { actorUserId: userId, attachments: [] });
    const provider: IStorageProvider = {
      upload: async () => {
        throw new Error('unexpected upload');
      },
      delete: async () => {
        throw new Error('storage unavailable');
      },
      read: async () => Buffer.alloc(0),
      getPublicUrl: () => '',
    };
    const files = new PrismaStoredFileRepository(prisma);
    const storage = new TaskFileStorageAdapter(new StorageService(provider, files), files);

    await expect(storage.deleteMany([key])).rejects.toThrow('storage unavailable');
    expect(await prisma.storedFile.findUnique({ where: { key } })).toMatchObject({
      taskId: created.id,
      deletionPendingAt: expect.any(Date),
    });
    await expect(
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Rebind removed key',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ).rejects.toThrow(InvalidTaskAttachmentsException);
  });

  it('should_retain_file_metadata_when_physical_delete_fails_after_task_delete', async () => {
    const created = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Delete with storage failure',
      status: TaskStatus.PLANNED,
      attachments: [key],
    });
    const provider: IStorageProvider = {
      upload: async () => {
        throw new Error('unexpected upload');
      },
      delete: async () => {
        throw new Error('storage unavailable');
      },
      read: async () => Buffer.alloc(0),
      getPublicUrl: () => '',
    };
    const files = new PrismaStoredFileRepository(prisma);
    const storage = new TaskFileStorageAdapter(new StorageService(provider, files), files);
    const deletion = new DeleteTaskUseCase(tasks, storage, new FindTaskByIdUseCase(tasks));

    await expect(deletion.execute(created.id, orgId)).rejects.toThrow('storage unavailable');
    expect(await prisma.task.findUnique({ where: { id: created.id } })).toBeNull();
    expect(await prisma.storedFile.findUnique({ where: { key } })).toMatchObject({
      ownerUserId: userId,
      taskId: null,
      deletionPendingAt: expect.any(Date),
    });
    await expect(
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Rebind pending key',
        status: TaskStatus.PLANNED,
        attachments: [key],
      }),
    ).rejects.toThrow(InvalidTaskAttachmentsException);
  });
});
