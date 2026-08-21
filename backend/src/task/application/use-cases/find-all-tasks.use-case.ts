import { Inject, Injectable } from '@nestjs/common';
import { FindAllTasksFilters, TaskRepositoryPort } from '../ports/task.repository.port';
import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { TaskReadModel } from '../read-models/task.read-model';

@Injectable()
export class FindAllTasksUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(
    organizationId: string,
    filters: FindAllTasksFilters = {},
  ): Promise<PaginatedResult<TaskReadModel>> {
    return this.taskRepository.findAll(organizationId, filters);
  }
}
