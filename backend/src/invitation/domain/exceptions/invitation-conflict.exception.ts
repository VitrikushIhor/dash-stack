import { ConflictException } from '../../../common/exceptions/domain.exception';
import { INVITATION_ERRORS } from '../constants/invitation-errors';

export class AlreadyMemberException extends ConflictException {
  constructor() {
    super(INVITATION_ERRORS.ALREADY_MEMBER);
  }
}

export class InvitationAlreadySentException extends ConflictException {
  constructor() {
    super(INVITATION_ERRORS.ALREADY_SENT);
  }
}
