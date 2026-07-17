import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { USER_ERRORS } from '../constants/user-errors';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(USER_ERRORS.USER_NOT_FOUND);
  }
}
