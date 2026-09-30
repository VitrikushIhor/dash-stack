import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PendingFileCleanupService } from '../infrastructure/maintenance/pending-file-cleanup.service';

const logger = new Logger('PendingFileCleanupCommand');

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(PendingFileCleanupService);
    const now = Date.now();
    await service.markAbandoned(new Date(now - 24 * 60 * 60 * 1000), 100);
    const result = await service.run(new Date(now - 60_000), 100);

    if (result.failed > 0) {
      throw new Error(`${result.failed} pending file deletions failed`);
    }
  } finally {
    await app.close();
  }
}

void main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : 'Pending file cleanup failed');
  process.exitCode = 1;
});
