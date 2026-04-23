import { TokenType, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PasswordService } from './services/password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { EmailService } from '../email/email.service';
import { TokensService } from './services/tokens.service';
import { UserRepository } from './repositories/user.repository';
import { VerificationTokenRepository } from './repositories/verification-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly tokensService: TokensService,
    private readonly userRepo: UserRepository,
    private readonly verificationTokenRepo: VerificationTokenRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async signup(data: SignupInput): Promise<{ message: string }> {
    const existingUser = await this.userRepo.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      data.password,
    );

    const user = await this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.first_name,
      lastName: data.last_name,
      emailVerified: null,
    });

    const token = randomUUID();
    await this.verificationTokenRepo.create({
      email: user.email,
      token,
      type: TokenType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.emailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyEmail(token: string): Promise<Token> {
    const verificationToken =
      await this.verificationTokenRepo.findByToken(token);

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.type !== TokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException('Invalid token type');
    }

    if (verificationToken.expires < new Date()) {
      await this.verificationTokenRepo.deleteById(verificationToken.id);
      throw new BadRequestException('Verification token has expired');
    }

    const user = await this.userRepo.updateEmailVerified(
      verificationToken.email,
      new Date(),
    );

    await this.verificationTokenRepo.deleteById(verificationToken.id);

    return this.tokensService.generateTokens(user.id);
  }

  async login(email: string, password: string): Promise<Token> {
    const user = await this.userRepo.findByEmail(email);

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
    const refreshToken = await this.refreshTokenRepo.findByToken(token);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepo.deleteById(refreshToken.id);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const accessToken = this.tokensService.generateAccessToken(
      refreshToken.userId,
    );

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const deleted = await this.refreshTokenRepo.deleteByToken(refreshToken);

    if (deleted.count === 0) {
      throw new BadRequestException('Invalid refresh token');
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenRepo.deleteAllByUserId(userId);
    return { message: 'Logged out from all devices' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    await this.verificationTokenRepo.deleteManyByEmailAndType(
      email,
      TokenType.PASSWORD_RESET,
    );

    const token = randomUUID();
    await this.verificationTokenRepo.create({
      email,
      token,
      type: TokenType.PASSWORD_RESET,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await this.emailService.sendPasswordResetEmail(email, token);

    return {
      message: 'If an account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resetToken = await this.verificationTokenRepo.findByToken(token);

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.type !== TokenType.PASSWORD_RESET) {
      throw new BadRequestException('Invalid token type');
    }

    if (resetToken.expires < new Date()) {
      await this.verificationTokenRepo.deleteById(resetToken.id);
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    await this.userRepo.updatePassword(resetToken.email, hashedPassword);

    await this.verificationTokenRepo.deleteById(resetToken.id);

    const user = await this.userRepo.findByEmail(resetToken.email);
    if (user) {
      await this.refreshTokenRepo.deleteAllByUserId(user.id);
    }

    return {
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }
}
