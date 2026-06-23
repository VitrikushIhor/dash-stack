import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { ORGANIZATION_ERRORS } from '../constants/organization-errors';

export class OrganizationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(ORGANIZATION_ERRORS.NOT_FOUND(id));
  }
}
