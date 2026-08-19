import { ForbiddenException } from '../../../common/exceptions/domain.exception';
import { ORGANIZATION_ERRORS } from '../constants/organization-errors';

export class InsufficientOrganizationPermissionsException extends ForbiddenException {
  constructor() {
    super(ORGANIZATION_ERRORS.INSUFFICIENT_PERMISSIONS());
  }
}
