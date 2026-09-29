import { Injectable } from '@nestjs/common';
import { Prisma, TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { SignupTransactionPort } from '../../application/ports/outgoing/signup-transaction.port';
import { CreateUserData } from '../../application/ports/outgoing/user.repository.port';
import { CreateVerificationTokenData } from '../../application/ports/outgoing/verification-token.repository.port';

function isEmailConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002')
    return false;
  const meta = error.meta;
  if (!meta || meta.modelName !== 'User') return false;
  const adapter = meta.driverAdapterError;
  if (typeof adapter !== 'object' || adapter === null || !('cause' in adapter)) return false;
  const cause: unknown = adapter.cause;
  if (typeof cause !== 'object' || cause === null || !('constraint' in cause)) return false;
  const constraint: unknown = cause.constraint;
  return (
    typeof constraint === 'object' &&
    constraint !== null &&
    'fields' in constraint &&
    Array.isArray(constraint.fields) &&
    constraint.fields.includes('email')
  );
}

@Injectable()
export class PrismaSignupTransaction implements SignupTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async createPending(user: CreateUserData, token: CreateVerificationTokenData): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.create({ data: user });
        await tx.verificationToken.create({
          data: { ...token, type: token.type as TokenType },
        });
      });
      return true;
    } catch (error: unknown) {
      if (isEmailConflict(error)) return false;
      throw error;
    }
  }
}
