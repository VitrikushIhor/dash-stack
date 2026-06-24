import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SignupUseCase } from '../../application/use-cases/commands/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/commands/login.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/commands/verify-email.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/commands/logout.use-case';
import { LogoutAllUseCase } from '../../application/use-cases/commands/logout-all.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/commands/reset-password.use-case';
import { OAuthExchangeUseCase } from '../../application/use-cases/commands/oauth-exchange.use-case';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LogoutDto } from '../dto/logout.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { OAuthExchangeDto } from '../dto/oauth-exchange.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly oauthExchangeUseCase: OAuthExchangeUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() data: SignupDto) {
    return this.signupUseCase.execute({
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
    });
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() { token }: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute({ token });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto) {
    return this.loginUseCase.execute({ email, password });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() { token }: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute({ token });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() { refreshToken }: LogoutDto) {
    return this.logoutUseCase.execute({ refreshToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Request() req) {
    return this.logoutAllUseCase.execute({ userId: req.user.id });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute({ email });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute({ token, newPassword: password });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = req.user;
    return user;
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  async oauthExchange(@Body() { token }: OAuthExchangeDto) {
    return this.oauthExchangeUseCase.execute({ auth0Token: token });
  }
}
