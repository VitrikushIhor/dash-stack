import { UpdateTaskUseCase } from '../../../application/use-cases/update-task.use-case';
import { FindTaskByIdUseCase } from '../../../application/use-cases/find-task-by-id.use-case';
import { TaskRepositoryPort } from '../../../application/ports/task.repository.port';
import { TaskFileStoragePort } from '../../../application/ports/task-file-storage.port';
import { TaskAssigneeValidatorService } from '../../../application/services/task-assignee-validator.service';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { UpdateTaskCommand } from '../../../application/commands/update-task.command';
import { InvalidTaskDatesException } from '../../../domain/exceptions/invalid-task-dates.exception';
import { TaskReadModel } from '../../../application/read-models/task.read-model';
import { TaskLabelValidatorService } from '../../../application/services/task-label-validator.service';
import { InvalidTaskLabelException } from '../../../domain/exceptions/invalid-task-label.exception';

const mockTask = (overrides?: Partial<TaskReadModel>): TaskReadModel => ({
  id: 'task-1',
  organizationId: 'org-1',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.PLANNED,
  startDate: new Date('2026-06-01T00:00:00.000Z'),
  dueDate: new Date('2026-06-10T00:00:00.000Z'),
  completedAt: null,
  attachments: [],
  createdAt: new Date('2026-06-01T00:00:00.000Z'),
  updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  assignees: [],
  label: null,
  checklists: [],
  ...overrides,
});

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
  let taskRepository: jest.Mocked<TaskRepositoryPort>;
  let taskFileStorage: jest.Mocked<TaskFileStoragePort>;
  let findTaskByIdUseCase: jest.Mocked<FindTaskByIdUseCase>;
  let assigneeValidator: jest.Mocked<TaskAssigneeValidatorService>;
  let labelValidator: jest.Mocked<TaskLabelValidatorService>;

  beforeEach(() => {
    taskRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllUnpaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    };
    taskFileStorage = {
      prepareDeletion: jest.fn(),
      deleteMany: jest.fn(),
    };
    findTaskByIdUseCase = {
      execute: jest.fn(),
    } as any;
    assigneeValidator = {
      validateOrThrow: jest.fn(),
    } as any;
    labelValidator = {
      validateOrThrow: jest.fn(),
    } as unknown as jest.Mocked<TaskLabelValidatorService>;
    useCase = new UpdateTaskUseCase(
      taskRepository,
      taskFileStorage,
      findTaskByIdUseCase,
      assigneeValidator,
      labelValidator,
    );
  });

  it('should update task details successfully', async () => {
    const existingTask = mockTask({
      title: 'Old Title',
      status: TaskStatus.PLANNED,
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.update.mockResolvedValue(mockTask({ title: 'New Title' }));

    const command: UpdateTaskCommand = {
      title: 'New Title',
      description: 'New Description',
      status: TaskStatus.UPCOMING,
    };

    const result = await useCase.execute('task-1', 'org-1', 'user-1', command);

    expect(result.title).toBe('New Title');
    expect(findTaskByIdUseCase.execute).toHaveBeenCalledWith('task-1', 'org-1');
    expect(assigneeValidator.validateOrThrow).toHaveBeenCalledWith('org-1', undefined);
    expect(taskRepository.update).toHaveBeenCalledWith('task-1', 'org-1', {
      actorUserId: 'user-1',
      title: 'New Title',
      description: 'New Description',
      status: TaskStatus.UPCOMING,
      assigneeIds: undefined,
      attachments: undefined,
      startDate: undefined,
      dueDate: undefined,
      completedAt: undefined,
      labelId: undefined,
      checklists: undefined,
    });
  });

  it('should validate and call storage to delete removed attachments', async () => {
    const existingTask = mockTask({
      attachments: ['file-1.png', 'file-2.pdf', 'file-3.jpg'],
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskFileStorage.deleteMany.mockResolvedValue(undefined);
    taskFileStorage.prepareDeletion.mockResolvedValue(['file-2.pdf', 'file-3.jpg']);
    taskRepository.update.mockResolvedValue(mockTask());

    const command: UpdateTaskCommand = {
      attachments: ['file-1.png'],
    };

    await useCase.execute('task-1', 'org-1', 'user-1', command);

    expect(taskFileStorage.deleteMany).toHaveBeenCalledWith(['file-2.pdf', 'file-3.jpg']);
    expect(taskFileStorage.prepareDeletion).toHaveBeenCalledWith('task-1', [
      'file-2.pdf',
      'file-3.jpg',
    ]);
    expect(taskRepository.update).toHaveBeenCalledWith(
      'task-1',
      'org-1',
      expect.objectContaining({
        attachments: ['file-1.png'],
      }),
    );
  });

  it('should not call storage to delete attachments if none are removed', async () => {
    const existingTask = mockTask({
      attachments: ['file-1.png'],
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.update.mockResolvedValue(mockTask());

    const command: UpdateTaskCommand = {
      attachments: ['file-1.png', 'file-2.pdf'],
    };

    await useCase.execute('task-1', 'org-1', 'user-1', command);

    expect(taskFileStorage.deleteMany).not.toHaveBeenCalled();
  });

  it('should throw InvalidTaskDatesException if new startDate/dueDate range is invalid', async () => {
    const existingTask = mockTask({
      startDate: new Date('2026-06-01T00:00:00.000Z'),
      dueDate: new Date('2026-06-10T00:00:00.000Z'),
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);

    const command: UpdateTaskCommand = {
      startDate: '2026-06-15T00:00:00.000Z', // > existing dueDate (10th)
    };

    await expect(useCase.execute('task-1', 'org-1', 'user-1', command)).rejects.toThrow(
      InvalidTaskDatesException,
    );
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('should update completedAt date when task status changes to COMPLETED', async () => {
    const existingTask = mockTask({
      status: TaskStatus.PLANNED,
      completedAt: null,
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.update.mockResolvedValue(mockTask());

    const command: UpdateTaskCommand = {
      status: TaskStatus.COMPLETED,
    };

    await useCase.execute('task-1', 'org-1', 'user-1', command);

    expect(taskRepository.update).toHaveBeenCalledWith(
      'task-1',
      'org-1',
      expect.objectContaining({
        status: TaskStatus.COMPLETED,
        completedAt: expect.any(Date),
      }),
    );
  });

  it('should not update a task when label does not belong to the organization', async () => {
    findTaskByIdUseCase.execute.mockResolvedValue(mockTask());
    labelValidator.validateOrThrow.mockRejectedValue(new InvalidTaskLabelException());

    await expect(
      useCase.execute('task-1', 'org-1', 'user-1', { labelId: 'foreign-label' }),
    ).rejects.toThrow(InvalidTaskLabelException);

    expect(labelValidator.validateOrThrow).toHaveBeenCalledWith('org-1', 'foreign-label');
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('should set completedAt to null when task status changes from COMPLETED', async () => {
    const existingTask = mockTask({
      status: TaskStatus.COMPLETED,
      completedAt: new Date('2026-06-05T00:00:00.000Z'),
    });
    findTaskByIdUseCase.execute.mockResolvedValue(existingTask);
    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.update.mockResolvedValue(mockTask());

    const command: UpdateTaskCommand = {
      status: TaskStatus.PLANNED,
    };

    await useCase.execute('task-1', 'org-1', 'user-1', command);

    expect(taskRepository.update).toHaveBeenCalledWith(
      'task-1',
      'org-1',
      expect.objectContaining({
        status: TaskStatus.PLANNED,
        completedAt: null,
      }),
    );
  });
});
