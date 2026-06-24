import { BadRequestException } from '../../../common/exceptions/domain.exception';
import { INVITATION_ERRORS } from '../constants/invitation-errors';

export class InvitationEmailMismatchException extends BadRequestException {
  constructor() {
    super(INVITATION_ERRORS.EMAIL_MISMATCH);
  }
}

export class InvitationAlreadyAcceptedException extends BadRequestException {
  constructor() {
    super(INVITATION_ERRORS.ALREADY_ACCEPTED);
  }
}

export class InvitationExpiredException extends BadRequestException {
  constructor() {
    super(INVITATION_ERRORS.EXPIRED);
  }
}
