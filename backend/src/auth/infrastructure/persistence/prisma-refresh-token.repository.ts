import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  RefreshTokenRepositoryPort,
  RefreshTokenModel,
  CreateRefreshTokenData,
} from '../../application/ports/outgoing/refresh-token.repository.port';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByToken(token: string): Promise<RefreshTokenModel | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  create(data: CreateRefreshTokenData): Promise<RefreshTokenModel> {
    return this.prisma.refreshToken.create({ data });
  }

  deleteById(id: string): Promise<RefreshTokenModel> {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteByToken(token: string): Promise<{ count: number }> {
    return this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  deleteAllByUserId(userId: string): Promise<{ count: number }> {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
