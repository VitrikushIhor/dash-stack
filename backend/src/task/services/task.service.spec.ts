import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from '../repositories/task.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../enums/task-status.enum';

describe('TaskService', () => {
  let service: TaskService;
  let repository: TaskRepository;

  const mockTaskRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    validateMemberships: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repository = module.get<TaskRepository>(TaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const orgId = 'org-1';
    const dto = {
      title: 'New Task',
      assigneeIds: ['mem-1'],
      label: { name: 'Bug', color: '#FF0000' },
    };

    it('should create a task if memberships are valid', async () => {
      mockTaskRepository.validateMemberships.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue({ id: 'task-1', ...dto });

      const result = await service.create(orgId, dto);

      expect(repository.validateMemberships).toHaveBeenCalledWith(
        orgId,
        dto.assigneeIds,
      );
      expect(repository.create).toHaveBeenCalled();
      expect(result.id).toBe('task-1');
    });

    it('should throw BadRequestException if memberships are invalid', async () => {
      mockTaskRepository.validateMemberships.mockResolvedValue(false);

      await expect(service.create(orgId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return a task if found', async () => {
      const task = { id: 'task-1', title: 'Task 1' };
      mockTaskRepository.findById.mockResolvedValue(task);

      const result = await service.findById('task-1', 'org-1');
      expect(result).toBe(task);
    });

    it('should throw NotFoundException if not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.findById('task-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const orgId = 'org-1';
    const taskId = 'task-1';
    const dto = { title: 'Updated' };

    it('should update task if found', async () => {
      mockTaskRepository.findById.mockResolvedValue({ id: taskId });
      mockTaskRepository.update.mockResolvedValue({ id: taskId, ...dto });

      const result = await service.update(taskId, orgId, dto);
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if task to update does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.update(taskId, orgId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulk operations', () => {
    it('should call updateMany in repository', async () => {
      const ids = ['1', '2'];
      const dto = { status: TaskStatus.COMPLETED };
      mockTaskRepository.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.updateMany('org-1', ids, dto);
      expect(repository.updateMany).toHaveBeenCalledWith(
        'org-1',
        ids,
        expect.any(Object),
      );
      expect(result.count).toBe(2);
    });

    it('should call deleteMany in repository', async () => {
      const ids = ['1', '2'];
      mockTaskRepository.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteMany('org-1', ids);
      expect(repository.deleteMany).toHaveBeenCalledWith('org-1', ids);
      expect(result.count).toBe(2);
    });
  });
});
