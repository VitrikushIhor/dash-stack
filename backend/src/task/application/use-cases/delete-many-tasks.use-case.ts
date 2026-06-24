import { Inject, Injectable } from '@nestjs/common';
import { TaskRepositoryPort } from '../ports/task.repository.port';

@Injectable()
export class DeleteManyTasksUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(organizationId: string, ids: string[]) {
    return this.taskRepository.deleteMany(organizationId, ids);
  }
}
