import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import {
  AuthCredentialRetentionService,
  RATE_LIMIT_CLEANUP_BATCH_SIZE,
} from '../infrastructure/maintenance/auth-credential-retention.service';

const logger = new Logger('AuthCredentialRetentionCommand');
const BATCH_SIZE = 100;
const MAX_BATCHES = 10;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(AuthCredentialRetentionService);
    const cutoff = new Date(Date.now() - RETENTION_MS);

    for (let index = 0; index < MAX_BATCHES; index += 1) {
      const result = await service.run(cutoff, BATCH_SIZE);
      if (
        result.sessions < BATCH_SIZE &&
        result.verificationTokens < BATCH_SIZE &&
        result.rateLimits < RATE_LIMIT_CLEANUP_BATCH_SIZE
      ) {
        return;
      }
    }

    if (await service.hasBacklog(cutoff)) {
      throw new Error('Auth credential retention backlog exceeded bounded run');
    }
  } finally {
    await app.close();
  }
}

void main().catch(() => {
  logger.error('Auth credential retention failed');
  process.exitCode = 1;
});
