import { InternalErrorException } from '../../../common/exceptions/domain.exception';
import { ORGANIZATION_ERRORS } from '../constants/organization-errors';

export class TenantContextMissingException extends InternalErrorException {
  constructor() {
    super(ORGANIZATION_ERRORS.TENANT_CONTEXT_MISSING());
  }
}
