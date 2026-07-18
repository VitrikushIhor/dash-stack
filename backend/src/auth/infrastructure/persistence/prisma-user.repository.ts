import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  UserRepositoryPort,
  UserSummary,
  UserWithPassword,
  CreateUserData,
} from '../../application/ports/outgoing/user.repository.port';

const userSummarySelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  emailVerified: true,
  dob: true,
  bio: true,
  urls: true,
};

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserSummary | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userSummarySelect,
    });
  }

  findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        ...userSummarySelect,
        password: true,
      },
    });
  }

  findById(id: string): Promise<UserSummary | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSummarySelect,
    });
  }

  create(data: CreateUserData): Promise<UserSummary> {
    return this.prisma.user.create({
      data,
      select: userSummarySelect,
    });
  }

  updateEmailVerified(email: string, date: Date): Promise<UserSummary> {
    return this.prisma.user.update({
      where: { email },
      data: { emailVerified: date },
      select: userSummarySelect,
    });
  }

  updatePassword(email: string, hashedPassword: string): Promise<UserSummary> {
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: userSummarySelect,
    });
  }

  updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      dob?: Date;
      bio?: string;
      urls?: string[];
      avatar?: string;
    },
  ): Promise<UserSummary> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userSummarySelect,
    });
  }
}
