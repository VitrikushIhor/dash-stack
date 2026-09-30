import { BadRequestException } from '@nestjs/common';
import { TASK_ERRORS } from '../constants/task-errors';

export class InvalidTaskLabelException extends BadRequestException {
  constructor() {
    super(TASK_ERRORS.INVALID_LABEL);
  }
}
