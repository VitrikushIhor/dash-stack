import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { ORGANIZATION_ERRORS } from '../constants/organization-errors';

export class OrganizationNotFoundBySlugException extends NotFoundException {
  constructor(slug: string) {
    super(ORGANIZATION_ERRORS.NOT_FOUND_BY_SLUG(slug));
  }
}
