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

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────
  describe('create', () => {
    const orgId = 'org-1';
    const baseDto = {
      title: 'New Task',
      assigneeIds: ['mem-1'],
      label: { name: 'Bug', color: '#FF0000' },
    };

    it('should create a task if memberships are valid', async () => {
      mockTaskRepository.validateMemberships.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue({ id: 'task-1', ...baseDto });

      const result = await service.create(orgId, baseDto);

      expect(repository.validateMemberships).toHaveBeenCalledWith(
        orgId,
        baseDto.assigneeIds,
      );
      expect(repository.create).toHaveBeenCalled();
      expect(result.id).toBe('task-1');
    });

    it('should throw BadRequestException if memberships are invalid', async () => {
      mockTaskRepository.validateMemberships.mockResolvedValue(false);

      await expect(service.create(orgId, baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set completedAt when creating with COMPLETED status', async () => {
      const dto = { ...baseDto, status: TaskStatus.COMPLETED };
      mockTaskRepository.validateMemberships.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue({ id: 'task-1' });

      await service.create(orgId, dto);

      const createCall = mockTaskRepository.create.mock.calls[0][0];
      expect(createCall.completedAt).toBeInstanceOf(Date);
    });

    it('should NOT set completedAt when creating without COMPLETED status', async () => {
      const dto = { ...baseDto, status: TaskStatus.PLANNED };
      mockTaskRepository.validateMemberships.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue({ id: 'task-1' });

      await service.create(orgId, dto);

      const createCall = mockTaskRepository.create.mock.calls[0][0];
      expect(createCall.completedAt).toBeUndefined();
    });

    it('should map startDate string to Date object', async () => {
      const dto = { ...baseDto, startDate: '2025-01-01T00:00:00.000Z' };
      mockTaskRepository.validateMemberships.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue({ id: 'task-1' });

      await service.create(orgId, dto);

      const createCall = mockTaskRepository.create.mock.calls[0][0];
      expect(createCall.startDate).toBeInstanceOf(Date);
    });
  });

  // ──────────────────────────────────────────────
  // findById
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────
  describe('update', () => {
    const orgId = 'org-1';
    const taskId = 'task-1';

    it('should update task if found', async () => {
      const dto = { title: 'Updated' };
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.PLANNED,
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId, ...dto });

      const result = await service.update(taskId, orgId, dto);
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if task to update does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(taskId, orgId, { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt when status transitions PLANNED → COMPLETED', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.PLANNED,
        completedAt: null,
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { status: TaskStatus.COMPLETED });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      expect(updateCall.completedAt).toBeInstanceOf(Date);
    });

    it('should set completedAt when status transitions UPCOMING → COMPLETED', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.UPCOMING,
        completedAt: null,
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { status: TaskStatus.COMPLETED });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      expect(updateCall.completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when reverting from COMPLETED → PLANNED', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { status: TaskStatus.PLANNED });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      expect(updateCall.completedAt).toBeNull();
    });

    it('should NOT touch completedAt when status is unchanged (no status in dto)', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { title: 'Rename only' });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      expect(updateCall.completedAt).toBeUndefined();
    });

    it('should NOT overwrite completedAt when task is already COMPLETED and stays COMPLETED', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.COMPLETED,
        completedAt: new Date('2025-01-01'),
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { status: TaskStatus.COMPLETED });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      // undefined means "don't touch" in Prisma — completedAt stays at original value
      expect(updateCall.completedAt).toBeUndefined();
    });

    it('should pass null for dueDate when explicitly clearing it', async () => {
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        status: TaskStatus.PLANNED,
        completedAt: null,
      });
      mockTaskRepository.update.mockResolvedValue({ id: taskId });

      await service.update(taskId, orgId, { dueDate: null });

      const updateCall = mockTaskRepository.update.mock.calls[0][2];
      expect(updateCall.dueDate).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // bulk operations
  // ──────────────────────────────────────────────
  describe('bulk operations', () => {
    it('should split updateMany into two queries when setting COMPLETED to preserve completedAt', async () => {
      const ids = ['1', '2'];
      mockTaskRepository.updateMany.mockResolvedValueOnce({ count: 1 }); // uncompleted
      mockTaskRepository.updateMany.mockResolvedValueOnce({ count: 1 }); // completed

      const result = await service.updateMany('org-1', ids, {
        status: TaskStatus.COMPLETED,
      });

      expect(mockTaskRepository.updateMany).toHaveBeenCalledTimes(2);
      expect(result.count).toBe(2);

      // Call 1: uncompleted tasks
      const call1Args = mockTaskRepository.updateMany.mock.calls[0];
      expect(call1Args[2].status).toBe(TaskStatus.COMPLETED);
      expect(call1Args[2].completedAt).toBeInstanceOf(Date);
      expect(call1Args[3]).toEqual({ completedAt: null });

      // Call 2: already completed tasks
      const call2Args = mockTaskRepository.updateMany.mock.calls[1];
      expect(call2Args[2].status).toBe(TaskStatus.COMPLETED);
      expect(call2Args[3]).toEqual({ completedAt: { not: null } });
    });

    it('should throw BadRequestException when status is undefined in updateMany', async () => {
      await expect(
        // Cast to bypass TypeScript since the guard defends against runtime misuse
        service.updateMany('org-1', ['1', '2'], { status: undefined as any }),
      ).rejects.toThrow(BadRequestException);

      // Should not do any updates
      expect(mockTaskRepository.updateMany).not.toHaveBeenCalled();
    });

    it('should return the correct count from updateMany for non-COMPLETED', async () => {
      mockTaskRepository.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.updateMany('org-1', ['1', '2', '3'], {
        status: TaskStatus.PLANNED,
      });
      expect(result.count).toBe(3);
      expect(mockTaskRepository.updateMany).toHaveBeenCalledTimes(1);
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
