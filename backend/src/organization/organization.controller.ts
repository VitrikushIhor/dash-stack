import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../common/guards/membership-role.guard';
import { OrgRole, User } from '@prisma/client';
import { UserEntity } from '../common/decorators/user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@UserEntity() user: User, @Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(user.id, dto);
  }

  @Get()
  findAllForUser(@UserEntity() user: User) {
    return this.organizationService.findAllForUser(user.id);
  }

  @Get(':orgId')
  @UseGuards(MembershipRoleGuard)
  @RequireOrgRole(OrgRole.GUEST)
  findById(@Param('orgId') orgId: string) {
    return this.organizationService.findById(orgId);
  }

  @Patch(':orgId')
  @UseGuards(MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  update(@Param('orgId') orgId: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationService.update(orgId, dto);
  }

  @Delete(':orgId')
  @UseGuards(MembershipRoleGuard)
  @RequireOrgRole(OrgRole.OWNER)
  delete(@Param('orgId') orgId: string) {
    return this.organizationService.delete(orgId);
  }
}
