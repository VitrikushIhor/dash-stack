import { HttpException, HttpStatus } from '@nestjs/common';

export class StorageException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, status, options);
  }
}

export class StorageUploadException extends StorageException {
  constructor(cause?: Error) {
    super(
      'Failed to upload file to storage',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        cause,
      },
    );
  }
}

export class StorageDeleteException extends StorageException {
  constructor(cause?: Error) {
    super(
      'Failed to delete file from storage',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { cause },
    );
  }
}

export class StorageValidationException extends StorageException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
