import {
  ServiceUnavailableException,
  UpstreamServiceException,
} from '../../../common/exceptions/domain.exception';
import { IMAGE_SEARCH_ERRORS } from '../constants/image-search-errors';

export class ImageSearchUnavailableException extends UpstreamServiceException {
  constructor() {
    super(IMAGE_SEARCH_ERRORS.UNAVAILABLE);
  }
}

export class ImageSearchConfigurationException extends ServiceUnavailableException {
  constructor() {
    super(IMAGE_SEARCH_ERRORS.CONFIGURATION_MISSING);
  }
}
