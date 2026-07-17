import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { FindUserMembershipsUseCase } from '../../../organization/application/use-cases/find-user-memberships.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly findUserMembershipsUseCase: FindUserMembershipsUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Get()
  async me(@Request() req) {
    return this.getCurrentUserUseCase.execute(req.user.id);
  }

  @Get('memberships')
  async getMemberships(@Request() req) {
    return this.findUserMembershipsUseCase.execute(req.user.id);
  }
}
