import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import {
  SessionCredential,
  SessionCredentialPort,
} from '../../application/ports/outgoing/session-credential.port';

@Injectable()
export class SessionCredentialAdapter implements SessionCredentialPort {
  create(): SessionCredential {
    const raw = randomBytes(32).toString('base64url');

    return { raw, hash: this.hash(raw) };
  }

  hash(rawCredential: string): string {
    return createHash('sha256').update(rawCredential, 'utf8').digest('hex');
  }
}
