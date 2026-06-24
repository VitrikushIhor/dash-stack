import { Inject, Injectable } from '@nestjs/common';
import {
  FindAllTasksFilters,
  TaskRepositoryPort,
} from '../ports/task.repository.port';

@Injectable()
export class FindAllTasksUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(organizationId: string, filters: FindAllTasksFilters = {}) {
    return this.taskRepository.findAll(organizationId, filters);
  }
}
