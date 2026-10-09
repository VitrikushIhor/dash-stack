import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  OAuthSignupData,
  OAuthSignupTransactionPort,
} from '../../application/ports/outgoing/oauth-signup-transaction.port';

@Injectable()
export class PrismaOAuthSignupTransaction implements OAuthSignupTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: OAuthSignupData): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: data.user, select: { id: true } });
      await tx.account.create({
        data: {
          userId: user.id,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      });
      return user.id;
    });
  }
}
