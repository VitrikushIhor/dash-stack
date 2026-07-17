import { BadRequestException } from '../../common/exceptions/domain.exception';
import { STORAGE_ERRORS } from './storage-errors';

export class StorageException extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

export class StorageUploadException extends StorageException {
  constructor(cause?: Error) {
    super(STORAGE_ERRORS.UPLOAD_FAILED, cause);
  }
}

export class StorageDeleteException extends StorageException {
  constructor(cause?: Error) {
    super(STORAGE_ERRORS.DELETE_FAILED, cause);
  }
}

export class StorageValidationException extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
