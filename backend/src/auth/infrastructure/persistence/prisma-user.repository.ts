import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  UserRepositoryPort,
  UserModel,
  CreateUserData,
} from '../../application/ports/outgoing/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<UserModel> {
    return this.prisma.user.create({ data });
  }

  updateEmailVerified(email: string, date: Date): Promise<UserModel> {
    return this.prisma.user.update({
      where: { email },
      data: { emailVerified: date },
    });
  }

  updatePassword(email: string, hashedPassword: string): Promise<UserModel> {
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
