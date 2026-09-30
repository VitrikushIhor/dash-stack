import { parseSessionUserAgent } from '../validators/session-user-agent.validator';
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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
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
import { OAuthCodeDto } from '../dto/oauth-code.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthCookieHelper } from '../helpers/auth-cookie.helper';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import {
  BadRequestException,
  UnauthorizedException,
} from '../../../common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';
import { getAuthAccountTracker } from '../throttling/auth-account-tracker';
import {
  getAuthCredentialTracker,
  getRefreshCredentialTracker,
} from '../throttling/auth-credential-tracker';

const EMPTY_REQUEST: Pick<ExpressRequest, 'headers'> = { headers: {} };

@Controller('auth')
@UseGuards(ThrottlerGuard)
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

  @Throttle({ default: { limit: 5, ttl: 60000, getTracker: getAuthAccountTracker } })
  @Post('signup')
  async signup(@Body() data: SignupDto) {
    return this.signupUseCase.execute({
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000, getTracker: getAuthCredentialTracker } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() { token }: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.verifyEmailUseCase.execute({ token });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return { authenticated: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60000, getTracker: getAuthAccountTracker } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req: Pick<ExpressRequest, 'headers'> = EMPTY_REQUEST,
  ) {
    const userAgent = parseSessionUserAgent(req.headers['user-agent']);
    const tokens = await this.loginUseCase.execute({
      email,
      password,
      ...(userAgent ? { userAgent } : {}),
    });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return { authenticated: true };
  }

  @Throttle({ default: { limit: 20, ttl: 60000, getTracker: getRefreshCredentialTracker } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@RefreshToken() token: string, @Res({ passthrough: true }) res: Response) {
    if (!token) throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    const tokens = await this.refreshTokenUseCase.execute({
      token,
    });
    AuthCookieHelper.setAuthCookies(res, tokens);
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@RefreshToken() refreshToken: string, @Res({ passthrough: true }) res: Response) {
    if (!refreshToken) throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);

    const result = await this.logoutUseCase.execute({ refreshToken });
    AuthCookieHelper.clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Request() req: ExpressRequest & { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.logoutAllUseCase.execute({ userId: req.user.id });
    AuthCookieHelper.clearAuthCookies(res);
    return result;
  }

  @Throttle({ default: { limit: 3, ttl: 60000, getTracker: getAuthAccountTracker } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute({ email });
  }

  @Throttle({ default: { limit: 5, ttl: 60000, getTracker: getAuthCredentialTracker } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute({ token, newPassword: password });
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  async oauthExchange() {
    throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN);
  }

  @Throttle({ default: { limit: 5, ttl: 60000, getTracker: getAuthCredentialTracker } })
  @Post('oauth/code')
  @HttpCode(HttpStatus.OK)
  async oauthCode(
    @Body() { code, codeVerifier }: OAuthCodeDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req: Pick<ExpressRequest, 'headers'> = EMPTY_REQUEST,
  ) {
    const tokens = await this.oauthExchangeUseCase.executeCode(
      code,
      codeVerifier,
      parseSessionUserAgent(req.headers['user-agent']),
    );
    AuthCookieHelper.setAuthCookies(res, tokens);
    return { authenticated: true };
  }
}
