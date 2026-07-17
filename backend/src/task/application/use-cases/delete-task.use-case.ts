import { Inject, Injectable } from '@nestjs/common';
import { FindTaskByIdUseCase } from './find-task-by-id.use-case';
import { TaskFileStoragePort } from '../ports/task-file-storage.port';
import { TaskRepositoryPort } from '../ports/task.repository.port';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
    @Inject('TaskFileStoragePort')
    private readonly taskFileStorage: TaskFileStoragePort,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
  ) {}

  async execute(id: string, organizationId: string) {
    const task = await this.findTaskByIdUseCase.execute(id, organizationId);

    await this.taskRepository.delete(id, organizationId);

    if (task.attachments.length) {
      await this.taskFileStorage.deleteMany(task.attachments);
    }
  }
}
