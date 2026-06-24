import { BadRequestException } from '../../../common/exceptions/domain.exception';
import { TASK_ERRORS } from '../constants/task-errors';

export class InvalidTaskDatesException extends BadRequestException {
  constructor(message?: string) {
    super(message ?? TASK_ERRORS.INVALID_DATE_RANGE);
  }
}

export class InvalidDateFormatException extends BadRequestException {
  constructor(value: string) {
    super(TASK_ERRORS.INVALID_DATE_FORMAT(value));
  }
}
