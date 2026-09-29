import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from './interfaces/storage.interface';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { PrismaStoredFileRepository } from './infrastructure/persistence/prisma-stored-file.repository';
import { PendingFileCleanupService } from './infrastructure/maintenance/pending-file-cleanup.service';
import { PrivateAttachmentController } from './private-attachment.controller';

@Global()
@Module({
  controllers: [StorageController, PrivateAttachmentController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('storage.provider', 's3');

        if (provider === 'local') {
          return new LocalStorageProvider(configService);
        }

        return new S3StorageProvider(configService);
      },
      inject: [ConfigService],
    },
    StorageService,
    PendingFileCleanupService,
    PrismaStoredFileRepository,
    {
      provide: 'StoredFileRepositoryPort',
      useExisting: PrismaStoredFileRepository,
    },
  ],
  exports: [StorageService, PendingFileCleanupService, 'StoredFileRepositoryPort'],
})
export class StorageModule {}
