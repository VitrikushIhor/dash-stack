import { Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  CompletePasswordResetData,
  PasswordResetTransactionPort,
} from '../../application/ports/outgoing/password-reset-transaction.port';

@Injectable()
export class PrismaPasswordResetTransaction implements PasswordResetTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async complete(data: CompletePasswordResetData): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const consumed = await tx.verificationToken.deleteMany({
        where: {
          id: data.tokenId,
          token: data.tokenHash,
          email: data.email,
          type: TokenType.PASSWORD_RESET,
          expires: { gt: data.now },
        },
      });

      if (consumed.count !== 1) {
        return false;
      }

      const user = await tx.user.update({
        where: { email: data.email },
        data: { password: data.hashedPassword },
        select: { id: true },
      });

      await tx.authSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: data.now },
      });

      return true;
    });
  }
}
