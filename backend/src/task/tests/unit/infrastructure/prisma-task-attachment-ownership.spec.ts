import { PrismaService } from 'nestjs-prisma';
import { PrismaTaskRepository } from '../../../infrastructure/persistence/prisma-task.repository';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { InvalidTaskAttachmentsException } from '../../../domain/exceptions/invalid-task-attachments.exception';

describe('PrismaTaskRepository attachment ownership', () => {
  const createData = {
    actorUserId: 'user-1',
    organizationId: 'org-1',
    title: 'Owned attachment task',
    status: TaskStatus.PLANNED,
    attachments: ['files/owned.pdf'],
  };

  it('should reject an attachment not owned by the actor before creating a task', async () => {
    const transaction = {
      storedFile: {
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn(),
      },
      task: {
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaTaskRepository(prisma);

    await expect(repository.create(createData)).rejects.toThrow(InvalidTaskAttachmentsException);
    expect(transaction.task.create).not.toHaveBeenCalled();
    expect(transaction.storedFile.updateMany).not.toHaveBeenCalled();
  });

  it('should reject the transaction when an attachment is claimed concurrently', async () => {
    const transaction = {
      storedFile: {
        count: jest.fn().mockResolvedValue(1),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      task: {
        create: jest.fn().mockResolvedValue({ id: 'task-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaTaskRepository(prisma);

    await expect(repository.create(createData)).rejects.toThrow(InvalidTaskAttachmentsException);
    expect(transaction.storedFile.updateMany).toHaveBeenCalledWith({
      where: {
        key: { in: ['files/owned.pdf'] },
        ownerUserId: 'user-1',
        taskId: null,
        deletionPendingAt: null,
        kind: 'ATTACHMENT',
      },
      data: { taskId: 'task-1' },
    });
  });
});
