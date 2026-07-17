import { CreateTaskUseCase } from '../../../application/use-cases/create-task.use-case';
import { TaskRepositoryPort } from '../../../application/ports/task.repository.port';
import { TaskAssigneeValidatorService } from '../../../application/services/task-assignee-validator.service';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { CreateTaskCommand } from '../../../application/commands/create-task.command';
import { InvalidTaskDatesException } from '../../../domain/exceptions/invalid-task-dates.exception';
import { InvalidAssigneesException } from '../../../domain/exceptions/invalid-assignees.exception';
import { TaskReadModel } from '../../../application/read-models/task.read-model';

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

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let taskRepository: jest.Mocked<TaskRepositoryPort>;
  let assigneeValidator: jest.Mocked<TaskAssigneeValidatorService>;

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
    assigneeValidator = {
      validateOrThrow: jest.fn(),
    } as any;
    useCase = new CreateTaskUseCase(taskRepository, assigneeValidator);
  });

  it('should successfully create a task', async () => {
    const command: CreateTaskCommand = {
      title: 'New Task',
      description: 'Some desc',
      status: TaskStatus.PLANNED,
      startDate: '2026-06-01T00:00:00.000Z',
      dueDate: '2026-06-10T00:00:00.000Z',
      assigneeIds: ['user-1'],
      attachments: ['attachment-1'],
      label: { name: 'Bug', color: '#ff0000' },
      checklists: [
        {
          name: 'To Do',
          items: [{ text: 'Item 1', completed: false }],
        },
      ],
    };

    const expectedTask = mockTask({
      title: 'New Task',
      description: 'Some desc',
      status: TaskStatus.PLANNED,
      startDate: new Date('2026-06-01T00:00:00.000Z'),
      dueDate: new Date('2026-06-10T00:00:00.000Z'),
    });

    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.create.mockResolvedValue(expectedTask);

    const result = await useCase.execute('org-1', command);

    expect(result).toBe(expectedTask);
    expect(assigneeValidator.validateOrThrow).toHaveBeenCalledWith('org-1', [
      'user-1',
    ]);
    expect(taskRepository.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      title: 'New Task',
      description: 'Some desc',
      status: TaskStatus.PLANNED,
      assigneeIds: ['user-1'],
      attachments: ['attachment-1'],
      startDate: new Date('2026-06-01T00:00:00.000Z'),
      dueDate: new Date('2026-06-10T00:00:00.000Z'),
      completedAt: undefined,
      label: { name: 'Bug', color: '#ff0000' },
      checklists: [
        {
          name: 'To Do',
          items: [{ text: 'Item 1', completed: false }],
        },
      ],
    });
  });

  it('should default status to PLANNED and empty arrays if optional fields are missing', async () => {
    const command: CreateTaskCommand = {
      title: 'Minimal Task',
      startDate: '2026-06-01T00:00:00.000Z',
      dueDate: '2026-06-10T00:00:00.000Z',
    };

    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.create.mockResolvedValue(mockTask());

    await useCase.execute('org-1', command);

    expect(taskRepository.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      title: 'Minimal Task',
      description: null,
      status: TaskStatus.PLANNED,
      assigneeIds: [],
      attachments: [],
      startDate: new Date('2026-06-01T00:00:00.000Z'),
      dueDate: new Date('2026-06-10T00:00:00.000Z'),
      completedAt: undefined,
      label: null,
      checklists: undefined,
    });
  });

  it('should resolve completedAt date for COMPLETED task', async () => {
    const command: CreateTaskCommand = {
      title: 'Completed Task',
      status: TaskStatus.COMPLETED,
      startDate: '2026-06-01T00:00:00.000Z',
      dueDate: '2026-06-10T00:00:00.000Z',
    };

    assigneeValidator.validateOrThrow.mockResolvedValue(undefined);
    taskRepository.create.mockResolvedValue(mockTask());

    await useCase.execute('org-1', command);

    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TaskStatus.COMPLETED,
        completedAt: expect.any(Date),
      }),
    );
  });

  it('should throw InvalidTaskDatesException if dates range is invalid', async () => {
    const command: CreateTaskCommand = {
      title: 'Invalid Dates Task',
      startDate: '2026-06-10T00:00:00.000Z',
      dueDate: '2026-06-01T00:00:00.000Z',
    };

    await expect(useCase.execute('org-1', command)).rejects.toThrow(
      InvalidTaskDatesException,
    );
    expect(taskRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidAssigneesException if assignees are invalid', async () => {
    const command: CreateTaskCommand = {
      title: 'Invalid Assignee Task',
      startDate: '2026-06-01T00:00:00.000Z',
      dueDate: '2026-06-10T00:00:00.000Z',
      assigneeIds: ['invalid-user'],
    };

    assigneeValidator.validateOrThrow.mockRejectedValue(
      new InvalidAssigneesException(),
    );

    await expect(useCase.execute('org-1', command)).rejects.toThrow(
      InvalidAssigneesException,
    );
    expect(taskRepository.create).not.toHaveBeenCalled();
  });
});
