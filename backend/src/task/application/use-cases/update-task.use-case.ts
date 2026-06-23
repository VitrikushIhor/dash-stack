import { Inject, Injectable } from '@nestjs/common';
import { FindTaskByIdUseCase } from './find-task-by-id.use-case';
import { TaskDates } from '../../domain/value-objects/task-dates.vo';
import { TaskStatusPolicy } from '../../domain/policies/task-status.policy';
import { TaskFileStoragePort } from '../ports/task-file-storage.port';
import { TaskRepositoryPort } from '../ports/task.repository.port';
import { TaskAssigneeValidatorService } from '../services/task-assignee-validator.service';
import { UpdateTaskCommand } from '../commands/update-task.command';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
    @Inject('TaskFileStoragePort')
    private readonly taskFileStorage: TaskFileStoragePort,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
    private readonly assigneeValidator: TaskAssigneeValidatorService,
  ) {}

  async execute(
    id: string,
    organizationId: string,
    command: UpdateTaskCommand,
  ) {
    const existingTask = await this.findTaskByIdUseCase.execute(
      id,
      organizationId,
    );

    await this.assigneeValidator.validateOrThrow(
      organizationId,
      command.assigneeIds,
    );

    const startDate = TaskDates.normalizeOptional(command.startDate);
    const dueDate = TaskDates.normalizeOptional(command.dueDate);

    TaskDates.validateRange(
      startDate === undefined ? existingTask.startDate : startDate,
      dueDate === undefined ? existingTask.dueDate : dueDate,
    );

    const nextAttachments = command.attachments;
    if (nextAttachments !== undefined) {
      const toDelete = existingTask.attachments.filter(
        (key) => !nextAttachments.includes(key),
      );

      if (toDelete.length) {
        await this.taskFileStorage.deleteMany(toDelete);
      }
    }

    return this.taskRepository.update(id, organizationId, {
      title: command.title,
      description: command.description,
      status: command.status,
      assigneeIds: command.assigneeIds,
      attachments: command.attachments,
      startDate,
      dueDate,
      completedAt: TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: existingTask.status,
        nextStatus: command.status,
      }),
      label: command.label,
      checklists: command.checklists,
    });
  }
}
