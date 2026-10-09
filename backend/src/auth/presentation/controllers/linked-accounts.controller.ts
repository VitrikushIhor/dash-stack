import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { LinkOAuthCodeDto } from '../dto/link-oauth-code.dto';
import { LinkOAuthAccountUseCase } from '../../application/use-cases/commands/link-oauth-account.use-case';
import { ListLinkedAccountsUseCase } from '../../application/use-cases/queries/list-linked-accounts.use-case';

@Controller('auth')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class LinkedAccountsController {
  constructor(
    private readonly linkAccount: LinkOAuthAccountUseCase,
    private readonly listAccounts: ListLinkedAccountsUseCase,
  ) {}
  @Get('accounts')
  list(@UserEntity() user: AuthUser): Promise<{ providers: string[] }> {
    return this.listAccounts.execute(user.id);
  }
  @Post('oauth/link-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  link(@UserEntity() user: AuthUser, @Body() data: LinkOAuthCodeDto): Promise<{ linked: true }> {
    return this.linkAccount.execute({
      userId: user.id,
      code: data.code,
      codeVerifier: data.codeVerifier,
      provider: data.provider,
    });
  }
}
