import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async create(organizationId: string, dto: CreateTaskDto) {
    return this.repository.create({
      ...dto,
      organizationId,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
  }

  async findAll(organizationId: string) {
    return this.repository.findAll(organizationId);
  }

  async findById(id: string, organizationId: string) {
    const task = await this.repository.findById(id, organizationId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, organizationId: string, dto: UpdateTaskDto) {
    try {
      return await this.repository.update(id, organizationId, {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      });
    } catch (e) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async delete(id: string, organizationId: string) {
    try {
      await this.repository.delete(id, organizationId);
      return { message: 'Task deleted successfully' };
    } catch (e) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
