import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import {
  OneTimeToken,
  OneTimeTokenPort,
} from '../../application/ports/outgoing/one-time-token.port';

@Injectable()
export class OneTimeTokenAdapter implements OneTimeTokenPort {
  create(): OneTimeToken {
    const raw = randomBytes(32).toString('base64url');
    return { raw, hash: this.hash(raw) };
  }

  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken, 'utf8').digest('hex');
  }
}
