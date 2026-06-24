import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageValidationException } from '../exceptions/storage.exception';
import { STORAGE_ERRORS } from '../exceptions/storage-errors';
import type { Request } from 'express';
import {
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_FILE_MIMES,
} from '../storage.constants';

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new StorageValidationException(
        STORAGE_ERRORS.INVALID_IMAGE_TYPE(file.mimetype, ALLOWED_IMAGE_MIMES),
      ),
      false,
    );
  }
}

function generalFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (ALLOWED_FILE_MIMES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new StorageValidationException(
        STORAGE_ERRORS.INVALID_FILE_TYPE(file.mimetype, ALLOWED_FILE_MIMES),
      ),
      false,
    );
  }
}

export const ImageUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
});

export const FileUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: generalFileFilter,
});
