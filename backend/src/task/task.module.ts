import { Module } from '@nestjs/common';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { TaskFileStorageAdapter } from './infrastructure/storage/task-file-storage.adapter';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { BulkUpdateTaskStatusUseCase } from './application/use-cases/bulk-update-task-status.use-case';
import { DeleteManyTasksUseCase } from './application/use-cases/delete-many-tasks.use-case';
import { FindTaskByIdUseCase } from './application/use-cases/find-task-by-id.use-case';
import { FindAllTasksUseCase } from './application/use-cases/find-all-tasks.use-case';
import { TaskController } from './presentation/task.controller';
import { TaskAssigneeValidatorService } from './application/services/task-assignee-validator.service';

@Module({
  controllers: [TaskController],
  providers: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    BulkUpdateTaskStatusUseCase,
    DeleteManyTasksUseCase,
    FindTaskByIdUseCase,
    FindAllTasksUseCase,
    TaskAssigneeValidatorService,
    PrismaTaskRepository,
    {
      provide: 'TaskRepositoryPort',
      useExisting: PrismaTaskRepository,
    },
    {
      provide: 'MembershipRepositoryPort',
      useExisting: PrismaTaskRepository,
    },
    {
      provide: 'TaskFileStoragePort',
      useClass: TaskFileStorageAdapter,
    },
  ],
  exports: [FindTaskByIdUseCase, FindAllTasksUseCase],
})
export class TaskModule {}
