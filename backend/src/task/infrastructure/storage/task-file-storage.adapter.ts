import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../storage/storage.service';
import { TaskFileStoragePort } from '../../application/ports/task-file-storage.port';

@Injectable()
export class TaskFileStorageAdapter implements TaskFileStoragePort {
  constructor(private readonly storageService: StorageService) {}

  async deleteMany(keys: string[]): Promise<void> {
    if (!keys.length) return;

    const results = await Promise.allSettled(
      keys.map((key) => this.storageService.deleteFile(key)),
    );

    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (rejected.length) {
      throw rejected[0].reason;
    }
  }
}
