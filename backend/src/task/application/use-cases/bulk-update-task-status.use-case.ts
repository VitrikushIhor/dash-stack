import { Inject, Injectable } from '@nestjs/common';
import { TASK_ERRORS } from '../../domain/constants/task-errors';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskStatusPolicy } from '../../domain/policies/task-status.policy';
import { TaskRepositoryPort } from '../ports/task.repository.port';
import { BadRequestException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class BulkUpdateTaskStatusUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async execute(organizationId: string, ids: string[], status?: TaskStatus) {
    if (status === undefined) {
      throw new BadRequestException(TASK_ERRORS.BULK_STATUS_REQUIRED);
    }

    return this.taskRepository.updateMany(organizationId, ids, {
      status,
      completedAt: TaskStatusPolicy.resolveCompletedAtOnBulkStatus(status),
    });
  }
}
