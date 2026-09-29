import { Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  CompleteEmailVerificationData,
  CompletedEmailVerification,
  EmailVerificationTransactionPort,
} from '../../application/ports/outgoing/email-verification-transaction.port';

@Injectable()
export class PrismaEmailVerificationTransaction implements EmailVerificationTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async complete(data: CompleteEmailVerificationData): Promise<CompletedEmailVerification | null> {
    return this.prisma.$transaction(async (tx) => {
      const consumed = await tx.verificationToken.deleteMany({
        where: {
          id: data.tokenId,
          token: data.tokenHash,
          email: data.email,
          type: TokenType.EMAIL_VERIFICATION,
          expires: { gt: data.now },
        },
      });

      if (consumed.count !== 1) return null;

      const verified = await tx.user.updateMany({
        where: { email: data.email, emailVerified: null },
        data: { emailVerified: data.now },
      });
      if (verified.count !== 1) return null;
      const user = await tx.user.findUniqueOrThrow({
        where: { email: data.email },
        select: { id: true },
      });
      const session = await tx.authSession.create({
        data: {
          userId: user.id,
          credentialHash: data.credentialHash,
          expiresAt: data.sessionExpiresAt,
        },
        select: { id: true },
      });

      return { userId: user.id, sessionId: session.id };
    });
  }
}
