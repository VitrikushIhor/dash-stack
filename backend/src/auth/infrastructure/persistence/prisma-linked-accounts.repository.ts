import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { LinkedAccountsPort } from '../../application/ports/outgoing/linked-accounts.port';
import {
  ConflictException,
  UnauthorizedException,
} from '../../../common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';

@Injectable()
export class PrismaLinkedAccountsRepository implements LinkedAccountsPort {
  constructor(private readonly prisma: PrismaService) {}
  async list(userId: string): Promise<string[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: { provider: true },
      distinct: ['provider'],
    });
    return accounts.map((account) => account.provider);
  }
  async link(userId: string, provider: string, providerAccountId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Serialize provider changes for one user without exposing a transaction to the use case.
        const users = await tx.$queryRaw<
          Array<{ id: string }>
        >`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
        if (!users.length) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
        const identity = await tx.account.findUnique({
          where: { provider_providerAccountId: { provider, providerAccountId } },
        });
        if (identity) {
          if (identity.userId !== userId)
            throw new ConflictException(AUTH_ERRORS.OAUTH_ACCOUNT_ALREADY_LINKED);
          return;
        }
        if (await tx.account.findFirst({ where: { userId, provider } })) {
          throw new ConflictException(AUTH_ERRORS.OAUTH_PROVIDER_ALREADY_LINKED);
        }
        await tx.account.create({ data: { userId, provider, providerAccountId } });
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(AUTH_ERRORS.OAUTH_ACCOUNT_ALREADY_LINKED);
      }
      throw error;
    }
  }
}
