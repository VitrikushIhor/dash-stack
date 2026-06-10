import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { FindAllTasksDto } from '../dto/find-all-tasks.dto';
import { TaskStatus } from '../enums/task-status.enum';
import { toDateOrUndefined, toDateOrNullish } from '../utils/date.utils';

@Injectable()
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async create(organizationId: string, dto: CreateTaskDto) {
    if (dto.assigneeIds?.length) {
      const isValid = await this.repository.validateMemberships(
        organizationId,
        dto.assigneeIds,
      );
      if (!isValid) {
        throw new BadRequestException(
          'One or more assigneeIds do not belong to this organization',
        );
      }
    }

    const completedAt =
      dto.status === TaskStatus.COMPLETED ? new Date() : undefined;

    return this.repository.create({
      ...dto,
      organizationId,
      startDate: toDateOrUndefined(dto.startDate),
      dueDate: toDateOrUndefined(dto.dueDate),
      completedAt,
    });
  }

  async findAll(organizationId: string, filters: FindAllTasksDto = {}) {
    return this.repository.findAll(organizationId, filters);
  }

  async findById(id: string, organizationId: string) {
    const task = await this.repository.findById(id, organizationId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, organizationId: string, dto: UpdateTaskDto) {
    const task = await this.repository.findById(id, organizationId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (dto.assigneeIds?.length) {
      const isValid = await this.repository.validateMemberships(
        organizationId,
        dto.assigneeIds,
      );
      if (!isValid) {
        throw new BadRequestException(
          'One or more assigneeIds do not belong to this organization',
        );
      }
    }

    // System-manage completedAt on status transitions.
    // undefined = "do not include in update payload" (Prisma skips undefined keys)
    let completedAt: Date | null | undefined = undefined;
    if (dto.status !== undefined) {
      const wasCompleted = task.status === TaskStatus.COMPLETED;
      const willBeCompleted = dto.status === TaskStatus.COMPLETED;

      if (willBeCompleted && !wasCompleted) {
        // Transitioning INTO completed for the first time
        completedAt = new Date();
      } else if (!willBeCompleted && wasCompleted) {
        // Reverting OUT of completed — clear the timestamp
        completedAt = null;
      }
      // If staying in same status (including COMPLETED→COMPLETED), leave undefined
    }

    return this.repository.update(id, organizationId, {
      ...dto,
      startDate: toDateOrNullish(dto.startDate),
      dueDate: toDateOrNullish(dto.dueDate),
      completedAt,
    });
  }

  async delete(id: string, organizationId: string) {
    const task = await this.repository.findById(id, organizationId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.repository.delete(id, organizationId);
  }

  async updateMany(
    organizationId: string,
    ids: string[],
    data: Pick<UpdateTaskDto, 'status'>,
  ) {
    if (data.status === undefined) {
      throw new BadRequestException('status is required for bulk update');
    }
    const completedAt =
      data.status === TaskStatus.COMPLETED ? new Date() : null;

    return this.repository.updateMany(organizationId, ids, {
      status: data.status,
      completedAt,
    });
  }

  async deleteMany(organizationId: string, ids: string[]) {
    return this.repository.deleteMany(organizationId, ids);
  }
}
