import { TaskStatus } from '../enums/task-status.enum';

export class TaskStatusPolicy {
  static resolveCompletedAtOnCreate(status: TaskStatus): Date | undefined {
    return status === TaskStatus.COMPLETED ? new Date() : undefined;
  }

  static resolveCompletedAtOnUpdate(params: {
    previousStatus: TaskStatus;
    nextStatus?: TaskStatus;
  }): Date | null | undefined {
    const { previousStatus, nextStatus } = params;

    if (nextStatus === undefined) return undefined;

    const wasCompleted = previousStatus === TaskStatus.COMPLETED;
    const willBeCompleted = nextStatus === TaskStatus.COMPLETED;

    if (!wasCompleted && willBeCompleted) return new Date();
    if (wasCompleted && !willBeCompleted) return null;

    return undefined;
  }

  static resolveCompletedAtOnBulkStatus(status: TaskStatus): Date | null {
    return status === TaskStatus.COMPLETED ? new Date() : null;
  }
}
