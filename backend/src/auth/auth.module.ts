import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityConfig } from '../common/configs/config.interface';
import { EmailModule } from '../email/email.module';
import { PasswordService } from './services/password.service';
import { TokensService } from './services/tokens.service';
import { OAuthService } from './services/oauth.service';
import { UserRepository } from './repositories/user.repository';
import { AccountRepository } from './repositories/account.repository';
import { VerificationTokenRepository } from './repositories/verification-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

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
    // Services
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PasswordService,
    TokensService,
    OAuthService,
    // Repositories
    UserRepository,
    AccountRepository,
    VerificationTokenRepository,
    RefreshTokenRepository,
  ],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
