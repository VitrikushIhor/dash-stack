import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { ORGANIZATION_ERRORS } from '../constants/organization-errors';

export class MemberNotFoundException extends NotFoundException {
  constructor(orgId: string, userId: string) {
    super(ORGANIZATION_ERRORS.MEMBER_NOT_FOUND(orgId, userId));
  }
}
