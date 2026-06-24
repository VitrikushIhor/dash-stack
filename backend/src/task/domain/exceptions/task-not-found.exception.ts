import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { TASK_ERRORS } from '../constants/task-errors';

export class TaskNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(TASK_ERRORS.NOT_FOUND(id));
  }
}
