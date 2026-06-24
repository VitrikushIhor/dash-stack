import { Inject, Injectable } from '@nestjs/common';
import { TaskRepositoryPort } from '../ports/task.repository.port';
import { TaskNotFoundException } from '../../domain/exceptions/task-not-found.exception';

@Injectable()
export class FindTaskByIdUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(id: string, organizationId: string) {
    const task = await this.taskRepository.findById(id, organizationId);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    return task;
  }
}
