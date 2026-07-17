import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { INVITATION_ERRORS } from '../constants/invitation-errors';

export class InvitationNotFoundException extends NotFoundException {
  constructor() {
    super(INVITATION_ERRORS.NOT_FOUND);
  }
}

export class InvitationNotInOrgException extends NotFoundException {
  constructor() {
    super(INVITATION_ERRORS.NOT_IN_ORG);
  }
}

export class OrgNotFoundException extends NotFoundException {
  constructor() {
    super(INVITATION_ERRORS.ORG_NOT_FOUND);
  }
}
