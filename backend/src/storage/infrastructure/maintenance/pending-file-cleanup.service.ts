import { Inject, Injectable, Logger } from '@nestjs/common';
import { StoredFileRepositoryPort } from '../../application/ports/stored-file.repository.port';
import { StorageService } from '../../storage.service';

export interface PendingFileCleanupResult {
  attempted: number;
  deleted: number;
  failed: number;
}

@Injectable()
export class PendingFileCleanupService {
  private readonly logger = new Logger(PendingFileCleanupService.name);

  constructor(
    private readonly storageService: StorageService,
    @Inject('StoredFileRepositoryPort')
    private readonly storedFileRepository: StoredFileRepositoryPort,
  ) {}

  async markAbandoned(before: Date, limit: number): Promise<number> {
    this.validateBatch(before, limit);
    const count = await this.storedFileRepository.markAbandonedAttachmentsPending(before, limit);
    this.logger.log(`Abandoned attachment uploads quarantined: ${count}`);
    return count;
  }

  async run(before: Date, limit: number): Promise<PendingFileCleanupResult> {
    this.validateBatch(before, limit);

    const keys = await this.storedFileRepository.findPendingDeletionKeys(before, limit);
    let deleted = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        await this.storageService.deleteFile(key);
        await this.storedFileRepository.deleteByKeys([key]);
        deleted += 1;
      } catch {
        failed += 1;
      }
    }

    const result = { attempted: keys.length, deleted, failed };
    this.logger.log(
      `Pending file cleanup: attempted=${result.attempted} deleted=${deleted} failed=${failed}`,
    );
    return result;
  }

  private validateBatch(before: Date, limit: number): void {
    if (Number.isNaN(before.getTime()) || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('Invalid pending file cleanup batch');
    }
  }
}
