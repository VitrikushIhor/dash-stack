import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request as ExpressRequest } from 'express';
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
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { OAuthExchangeDto } from '../dto/oauth-exchange.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthCookieHelper } from '../helpers/auth-cookie.helper';
import { RefreshToken } from '../decorators/refresh-token.decorator';

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

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
  async verifyEmail(@Body() { token }: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.verifyEmailUseCase.execute({ token });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return tokens;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.loginUseCase.execute({ email, password });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return tokens;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@RefreshToken() token: string, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.refreshTokenUseCase.execute({
      token,
    });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@RefreshToken() refreshToken: string, @Res({ passthrough: true }) res: Response) {
    AuthCookieHelper.clearAuthCookies(res);
    if (refreshToken) {
      return this.logoutUseCase.execute({ refreshToken });
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Request() req: ExpressRequest & { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    AuthCookieHelper.clearAuthCookies(res);
    return this.logoutAllUseCase.execute({ userId: req.user.id });
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute({ email });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute({ token, newPassword: password });
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  async oauthExchange(
    @Body() { token }: OAuthExchangeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.oauthExchangeUseCase.execute({
      auth0Token: token,
    });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return tokens;
  }
}
