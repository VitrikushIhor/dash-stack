import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
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
      new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
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
      new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_FILE_MIMES.join(', ')}`,
      ),
      false,
    );
  }
}

export const ImageUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter,
});

export const FileUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: generalFileFilter,
});
