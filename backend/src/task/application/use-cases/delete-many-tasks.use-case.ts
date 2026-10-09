import { Inject, Injectable } from '@nestjs/common';
import { TaskRepositoryPort } from '../ports/task.repository.port';
import { TaskFileStoragePort } from '../ports/task-file-storage.port';

@Injectable()
export class DeleteManyTasksUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
    @Inject('TaskFileStoragePort')
    private readonly taskFileStorage: TaskFileStoragePort,
  ) {}

  async execute(organizationId: string, ids: string[]) {
    const { count, keys } = await this.taskRepository.deleteMany(organizationId, ids);

    if (keys.length) await this.taskFileStorage.deleteMany(keys);
    return { count };
  }
}
