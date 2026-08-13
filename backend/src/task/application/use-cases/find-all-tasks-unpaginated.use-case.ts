import { Injectable, Inject } from '@nestjs/common';
import {
  TaskRepositoryPort,
  FindAllTasksUnpaginatedFilters,
} from '../ports/task.repository.port';
import { TaskReadModel } from '../read-models/task.read-model';

@Injectable()
export class FindAllTasksUnpaginatedUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(
    orgId: string,
    filters: FindAllTasksUnpaginatedFilters,
  ): Promise<TaskReadModel[]> {
    return this.taskRepository.findAllUnpaginated(orgId, filters);
  }
}
