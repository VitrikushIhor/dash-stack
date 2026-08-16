import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { FindUserMembershipsUseCase } from '../../../organization/application/use-cases/find-user-memberships.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/update-current-user.use-case';
import { CountUserOrganizationsUseCase } from '../../../organization/application/use-cases/count-user-organizations.use-case';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly findUserMembershipsUseCase: FindUserMembershipsUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private readonly countUserOrganizationsUseCase: CountUserOrganizationsUseCase,
  ) {}

  @Get()
  async me(@Request() req) {
    return this.getCurrentUserUseCase.execute(req.user.id);
  }

  @Patch()
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.updateCurrentUserUseCase.execute({
      userId: req.user.id,
      ...dto,
    });
  }

  @Get('memberships')
  async getMemberships(@Request() req) {
    return this.findUserMembershipsUseCase.execute(req.user.id);
  }

  @Get('organizations/count')
  async countOrganizations(@Request() req) {
    return this.countUserOrganizationsUseCase.execute(req.user.id);
  }
}
