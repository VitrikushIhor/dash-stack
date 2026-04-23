import { Injectable } from '@nestjs/common';
import { TokenType, VerificationToken } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

export interface CreateVerificationTokenData {
  email: string;
  token: string;
  type: TokenType;
  expires: Date;
}

@Injectable()
export class VerificationTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByToken(token: string): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.findUnique({ where: { token } });
  }

  create(data: CreateVerificationTokenData): Promise<VerificationToken> {
    return this.prisma.verificationToken.create({ data });
  }

  deleteById(id: string): Promise<VerificationToken> {
    return this.prisma.verificationToken.delete({ where: { id } });
  }

  deleteManyByEmailAndType(
    email: string,
    type: TokenType,
  ): Promise<{ count: number }> {
    return this.prisma.verificationToken.deleteMany({ where: { email, type } });
  }
}
