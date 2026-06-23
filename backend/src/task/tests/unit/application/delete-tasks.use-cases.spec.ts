import { DeleteTaskUseCase } from '../../../application/use-cases/delete-task.use-case';
import { DeleteManyTasksUseCase } from '../../../application/use-cases/delete-many-tasks.use-case';
import { FindTaskByIdUseCase } from '../../../application/use-cases/find-task-by-id.use-case';
import { TaskRepositoryPort } from '../../../application/ports/task.repository.port';
import { TaskFileStoragePort } from '../../../application/ports/task-file-storage.port';
import { TaskReadModel } from '../../../application/read-models/task.read-model';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

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

describe('Delete Tasks Use Cases', () => {
  let taskRepository: jest.Mocked<TaskRepositoryPort>;
  let taskFileStorage: jest.Mocked<TaskFileStoragePort>;
  let findTaskByIdUseCase: jest.Mocked<FindTaskByIdUseCase>;

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
    taskFileStorage = {
      deleteMany: jest.fn(),
    };
    findTaskByIdUseCase = {
      execute: jest.fn(),
    } as any;
  });

  describe('DeleteTaskUseCase', () => {
    let useCase: DeleteTaskUseCase;

    beforeEach(() => {
      useCase = new DeleteTaskUseCase(
        taskRepository,
        taskFileStorage,
        findTaskByIdUseCase,
      );
    });

    it('should delete a task and its attachments if they exist', async () => {
      const task = mockTask({ attachments: ['file-1.png', 'file-2.pdf'] });
      findTaskByIdUseCase.execute.mockResolvedValue(task);
      taskRepository.delete.mockResolvedValue(undefined);
      taskFileStorage.deleteMany.mockResolvedValue(undefined);

      await useCase.execute('task-1', 'org-1');

      expect(findTaskByIdUseCase.execute).toHaveBeenCalledWith(
        'task-1',
        'org-1',
      );
      expect(taskRepository.delete).toHaveBeenCalledWith('task-1', 'org-1');
      expect(taskFileStorage.deleteMany).toHaveBeenCalledWith([
        'file-1.png',
        'file-2.pdf',
      ]);
    });

    it('should delete a task but not call storage if there are no attachments', async () => {
      const task = mockTask({ attachments: [] });
      findTaskByIdUseCase.execute.mockResolvedValue(task);
      taskRepository.delete.mockResolvedValue(undefined);

      await useCase.execute('task-1', 'org-1');

      expect(findTaskByIdUseCase.execute).toHaveBeenCalledWith(
        'task-1',
        'org-1',
      );
      expect(taskRepository.delete).toHaveBeenCalledWith('task-1', 'org-1');
      expect(taskFileStorage.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('DeleteManyTasksUseCase', () => {
    let useCase: DeleteManyTasksUseCase;

    beforeEach(() => {
      useCase = new DeleteManyTasksUseCase(taskRepository);
    });

    it('should delete multiple tasks and return count', async () => {
      taskRepository.deleteMany.mockResolvedValue({ count: 5 });

      const result = await useCase.execute('org-1', ['task-1', 'task-2']);

      expect(result).toEqual({ count: 5 });
      expect(taskRepository.deleteMany).toHaveBeenCalledWith('org-1', [
        'task-1',
        'task-2',
      ]);
    });
  });
});
