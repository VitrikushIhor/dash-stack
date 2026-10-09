import { Controller, Delete, Get, Header, Param, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthUser, UserEntity } from '../../../common/decorators/user.decorator';
import { ManageSessionsUseCase } from '../../application/use-cases/manage-sessions.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  SessionIdDto,
  SessionListQueryDto,
  SessionListResponseDto,
  RevokeSessionResponseDto,
} from '../dto/session-management.dto';

@Controller('auth/sessions')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class SessionsController {
  constructor(private readonly sessions: ManageSessionsUseCase) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @UserEntity() user: AuthUser & { sessionId: string },
    @Query() query: SessionListQueryDto,
  ): Promise<SessionListResponseDto> {
    return this.sessions.list(user.id, user.sessionId, query.page);
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  revoke(
    @UserEntity() user: AuthUser & { sessionId: string },
    @Param() params: SessionIdDto,
  ): Promise<RevokeSessionResponseDto> {
    return this.sessions.revoke(user.id, user.sessionId, params.id);
  }
}
