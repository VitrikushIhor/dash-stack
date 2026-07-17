import { FindTaskByIdUseCase } from '../../../application/use-cases/find-task-by-id.use-case';
import { FindAllTasksUseCase } from '../../../application/use-cases/find-all-tasks.use-case';
import { TaskRepositoryPort } from '../../../application/ports/task.repository.port';
import { TaskReadModel } from '../../../application/read-models/task.read-model';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskNotFoundException } from '../../../domain/exceptions/task-not-found.exception';

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

describe('Find Tasks Use Cases', () => {
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
  });

  describe('FindTaskByIdUseCase', () => {
    let useCase: FindTaskByIdUseCase;

    beforeEach(() => {
      useCase = new FindTaskByIdUseCase(taskRepository);
    });

    it('should return a task if found', async () => {
      const expectedTask = mockTask();
      taskRepository.findById.mockResolvedValue(expectedTask);

      const result = await useCase.execute('task-1', 'org-1');

      expect(result).toBe(expectedTask);
      expect(taskRepository.findById).toHaveBeenCalledWith('task-1', 'org-1');
    });

    it('should throw TaskNotFoundException if task is not found', async () => {
      taskRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('task-1', 'org-1')).rejects.toThrow(
        TaskNotFoundException,
      );
      expect(taskRepository.findById).toHaveBeenCalledWith('task-1', 'org-1');
    });
  });

  describe('FindAllTasksUseCase', () => {
    let useCase: FindAllTasksUseCase;

    beforeEach(() => {
      useCase = new FindAllTasksUseCase(taskRepository);
    });

    it('should return tasks matching filters', async () => {
      const expectedTasks = [
        mockTask({ id: 'task-1' }),
        mockTask({ id: 'task-2' }),
      ];
      taskRepository.findAll.mockResolvedValue(expectedTasks);

      const filters = { search: 'Test', status: [TaskStatus.PLANNED] };
      const result = await useCase.execute('org-1', filters);

      expect(result).toEqual(expectedTasks);
      expect(taskRepository.findAll).toHaveBeenCalledWith('org-1', filters);
    });

    it('should use default empty filters if none are provided', async () => {
      taskRepository.findAll.mockResolvedValue([]);

      await useCase.execute('org-1');

      expect(taskRepository.findAll).toHaveBeenCalledWith('org-1', {});
    });
  });
});
