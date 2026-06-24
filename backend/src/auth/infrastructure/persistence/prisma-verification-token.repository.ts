import { Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  VerificationTokenRepositoryPort,
  VerificationTokenModel,
  CreateVerificationTokenData,
} from '../../application/ports/outgoing/verification-token.repository.port';
import { AuthTokenType } from '../../domain/enums/token-type.enum';

@Injectable()
export class PrismaVerificationTokenRepository implements VerificationTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToModel(token: {
    id: string;
    email: string;
    token: string;
    type: TokenType;
    expires: Date;
  }): VerificationTokenModel {
    return {
      id: token.id,
      email: token.email,
      token: token.token,
      type: token.type as unknown as AuthTokenType,
      expires: token.expires,
    };
  }

  async findByToken(token: string): Promise<VerificationTokenModel | null> {
    const result = await this.prisma.verificationToken.findUnique({
      where: { token },
    });
    return result ? this.mapToModel(result) : null;
  }

  async create(
    data: CreateVerificationTokenData,
  ): Promise<VerificationTokenModel> {
    const result = await this.prisma.verificationToken.create({
      data: {
        ...data,
        type: data.type as TokenType,
      },
    });
    return this.mapToModel(result);
  }

  async deleteById(id: string): Promise<VerificationTokenModel> {
    const result = await this.prisma.verificationToken.delete({
      where: { id },
    });
    return this.mapToModel(result);
  }

  deleteManyByEmailAndType(
    email: string,
    type: AuthTokenType,
  ): Promise<{ count: number }> {
    return this.prisma.verificationToken.deleteMany({
      where: { email, type: type as TokenType },
    });
  }
}
