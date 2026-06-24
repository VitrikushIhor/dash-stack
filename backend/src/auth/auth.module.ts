import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '../common/configs/config.interface';
import { EmailModule } from '../email/email.module';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { JwtStrategy } from './presentation/guards/jwt.strategy';

// Application — Use Cases
import { SignupUseCase } from './application/use-cases/commands/signup.use-case';
import { LoginUseCase } from './application/use-cases/commands/login.use-case';
import { VerifyEmailUseCase } from './application/use-cases/commands/verify-email.use-case';
import { RefreshTokenUseCase } from './application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/commands/logout.use-case';
import { LogoutAllUseCase } from './application/use-cases/commands/logout-all.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/commands/reset-password.use-case';
import { OAuthExchangeUseCase } from './application/use-cases/commands/oauth-exchange.use-case';
import { ValidateUserUseCase } from './application/use-cases/queries/validate-user.use-case';

// Infrastructure — Persistence
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { PrismaVerificationTokenRepository } from './infrastructure/persistence/prisma-verification-token.repository';
import { PrismaAccountRepository } from './infrastructure/persistence/prisma-account.repository';

// Infrastructure — Security
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtTokenGeneratorAdapter } from './infrastructure/security/jwt-token-generator.adapter';

// Infrastructure — Integrations
import { AuthMailerAdapter } from './infrastructure/integrations/auth-mailer.adapter';
import { Auth0ClientAdapter } from './infrastructure/integrations/auth0-client.adapter';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    // Presentation
    JwtStrategy,
    JwtAuthGuard,

    // Use Cases
    SignupUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    OAuthExchangeUseCase,
    ValidateUserUseCase,

    // Infrastructure — Persistence
    PrismaUserRepository,
    { provide: 'UserRepositoryPort', useExisting: PrismaUserRepository },
    PrismaRefreshTokenRepository,
    {
      provide: 'RefreshTokenRepositoryPort',
      useExisting: PrismaRefreshTokenRepository,
    },
    PrismaVerificationTokenRepository,
    {
      provide: 'VerificationTokenRepositoryPort',
      useExisting: PrismaVerificationTokenRepository,
    },
    PrismaAccountRepository,
    { provide: 'AccountRepositoryPort', useExisting: PrismaAccountRepository },

    // Infrastructure — Security
    BcryptPasswordHasherAdapter,
    {
      provide: 'PasswordHasherPort',
      useExisting: BcryptPasswordHasherAdapter,
    },
    JwtTokenGeneratorAdapter,
    {
      provide: 'TokenGeneratorPort',
      useExisting: JwtTokenGeneratorAdapter,
    },

    // Infrastructure — Integrations
    AuthMailerAdapter,
    { provide: 'AuthMailerPort', useExisting: AuthMailerAdapter },
    Auth0ClientAdapter,
    { provide: 'Auth0ClientPort', useExisting: Auth0ClientAdapter },
  ],
  exports: [JwtAuthGuard, ValidateUserUseCase],
})
export class AuthModule {}
