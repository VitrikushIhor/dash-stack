import { BadRequestException } from '../../../common/exceptions/domain.exception';
import { TASK_ERRORS } from '../constants/task-errors';

export class InvalidAssigneesException extends BadRequestException {
  constructor() {
    super(TASK_ERRORS.INVALID_ASSIGNEES);
  }
}
