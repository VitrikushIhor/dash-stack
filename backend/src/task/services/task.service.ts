import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskStatus } from '../enums/task-status.enum';

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

    return this.repository.create({
      ...dto,
      organizationId,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  async findAll(organizationId: string, filters: any = {}) {
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

    return this.repository.update(id, organizationId, {
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  async delete(id: string, organizationId: string) {
    const task = await this.repository.findById(id, organizationId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.repository.delete(id, organizationId);
  }

  async updateMany(organizationId: string, ids: string[], dto: UpdateTaskDto) {
    return this.repository.updateMany(organizationId, ids, {
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  async deleteMany(organizationId: string, ids: string[]) {
    return this.repository.deleteMany(organizationId, ids);
  }
}
