import { BulkUpdateTaskStatusUseCase } from '../../../application/use-cases/bulk-update-task-status.use-case';
import { TaskRepositoryPort } from '../../../application/ports/task.repository.port';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { TASK_ERRORS } from '../../../domain/constants/task-errors';

describe('BulkUpdateTaskStatusUseCase', () => {
  let useCase: BulkUpdateTaskStatusUseCase;
  let taskRepository: jest.Mocked<TaskRepositoryPort>;

  beforeEach(() => {
    taskRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    };
    useCase = new BulkUpdateTaskStatusUseCase(taskRepository);
  });

  it('should throw BadRequestException if status is undefined', async () => {
    await expect(
      useCase.execute('org-1', ['task-1', 'task-2'], undefined),
    ).rejects.toThrow(
      new BadRequestException(TASK_ERRORS.BULK_STATUS_REQUIRED),
    );

    expect(taskRepository.updateMany).not.toHaveBeenCalled();
  });

  it('should bulk update task status to COMPLETED and set completedAt date', async () => {
    taskRepository.updateMany.mockResolvedValue({ count: 2 });

    const result = await useCase.execute(
      'org-1',
      ['task-1', 'task-2'],
      TaskStatus.COMPLETED,
    );

    expect(result).toEqual({ count: 2 });
    expect(taskRepository.updateMany).toHaveBeenCalledWith(
      'org-1',
      ['task-1', 'task-2'],
      {
        status: TaskStatus.COMPLETED,
        completedAt: expect.any(Date),
      },
    );
  });

  it('should bulk update task status to UPCOMING and clear completedAt date', async () => {
    taskRepository.updateMany.mockResolvedValue({ count: 2 });

    const result = await useCase.execute(
      'org-1',
      ['task-1', 'task-2'],
      TaskStatus.UPCOMING,
    );

    expect(result).toEqual({ count: 2 });
    expect(taskRepository.updateMany).toHaveBeenCalledWith(
      'org-1',
      ['task-1', 'task-2'],
      {
        status: TaskStatus.UPCOMING,
        completedAt: null,
      },
    );
  });
});
