import { Inject, Injectable } from '@nestjs/common';
import { TaskDates } from '../../domain/value-objects/task-dates.vo';
import { TaskStatusPolicy } from '../../domain/policies/task-status.policy';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskRepositoryPort } from '../ports/task.repository.port';
import { TaskAssigneeValidatorService } from '../services/task-assignee-validator.service';
import { CreateTaskCommand } from '../commands/create-task.command';
import { TaskLabelValidatorService } from '../services/task-label-validator.service';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('TaskRepositoryPort')
    private readonly taskRepository: TaskRepositoryPort,
    private readonly assigneeValidator: TaskAssigneeValidatorService,
    private readonly labelValidator: TaskLabelValidatorService,
  ) {}

  async execute(organizationId: string, actorUserId: string, command: CreateTaskCommand) {
    const status = command.status ?? TaskStatus.PLANNED;
    const startDate = TaskDates.normalizeRequired(command.startDate);
    const dueDate = TaskDates.normalizeRequired(command.dueDate);

    TaskDates.validateRange(startDate, dueDate);

    await this.assigneeValidator.validateOrThrow(organizationId, command.assigneeIds);
    await this.labelValidator.validateOrThrow(organizationId, command.labelId);

    return this.taskRepository.create({
      actorUserId,
      organizationId,
      title: command.title,
      description: command.description ?? null,
      status,
      assigneeIds: command.assigneeIds ?? [],
      attachments: command.attachments ?? [],
      startDate,
      dueDate,
      completedAt: TaskStatusPolicy.resolveCompletedAtOnCreate(status),
      labelId: command.labelId ?? null,
      checklists: command.checklists,
    });
  }
}
