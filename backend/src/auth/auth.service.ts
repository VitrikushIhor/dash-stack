import { PrismaService } from 'nestjs-prisma';
import { TokenType, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PasswordService } from './services/password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { EmailService } from '../email/email.service';
import { TokensService } from './services/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly tokensService: TokensService,
  ) {}

  async signup(data: SignupInput): Promise<{ message: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(
      data.password,
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.first_name,
        lastName: data.last_name,
        emailVerified: null,
      },
    });

    // Create verification token
    const token = randomUUID();
    await this.prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        type: TokenType.EMAIL_VERIFICATION,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyEmail(token: string): Promise<Token> {
    // Find verification token
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.type !== TokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException('Invalid token type');
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await this.prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Verification token has expired');
    }

    // Update user's emailVerified
    const user = await this.prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    // Delete verification token
    await this.prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Generate and return tokens
    return this.tokensService.generateTokens(user.id);
  }

  async login(email: string, password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'This account uses social login. Please sign in with Google or GitHub.',
      );
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    return this.tokensService.generateTokens(user.id);
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Generate new access token
    const accessToken = this.tokensService.generateAccessToken(
      refreshToken.userId,
    );

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (deleted.count === 0) {
      throw new BadRequestException('Invalid refresh token');
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out from all devices' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    // Delete any existing reset tokens for this email
    await this.prisma.verificationToken.deleteMany({
      where: { email, type: TokenType.PASSWORD_RESET },
    });

    // Create new reset token
    const token = randomUUID();
    await this.prisma.verificationToken.create({
      data: {
        email,
        token,
        type: TokenType.PASSWORD_RESET,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send email
    await this.emailService.sendPasswordResetEmail(email, token);

    return {
      message: 'If an account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resetToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.type !== TokenType.PASSWORD_RESET) {
      throw new BadRequestException('Invalid token type');
    }

    if (resetToken.expires < new Date()) {
      await this.prisma.verificationToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    // Update user's password
    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete reset token
    await this.prisma.verificationToken.delete({
      where: { id: resetToken.id },
    });

    // Delete all refresh tokens (logout everywhere)
    const user = await this.prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (user) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });
    }

    return {
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
