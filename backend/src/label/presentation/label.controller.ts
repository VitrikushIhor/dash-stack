import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { MembershipRoleGuard, RequireOrgRole } from '../../common/guards/membership-role.guard';
import { OrgRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateLabelUseCase } from '../application/use-cases/create-label.use-case';
import { UpdateLabelUseCase } from '../application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from '../application/use-cases/delete-label.use-case';
import { FindAllLabelsUseCase } from '../application/use-cases/find-all-labels.use-case';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('organizations/:orgId/labels')
@UseGuards(JwtAuthGuard, MembershipRoleGuard)
export class LabelController {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
    private readonly findAllLabelsUseCase: FindAllLabelsUseCase,
  ) {}

  @Post()
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Create a new label' })
  create(@Param('orgId') orgId: string, @Body() dto: CreateLabelDto) {
    return this.createLabelUseCase.execute(orgId, dto);
  }

  @Get()
  @RequireOrgRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'List all labels for an organization' })
  findAll(@Param('orgId') orgId: string) {
    return this.findAllLabelsUseCase.execute(orgId);
  }

  @Patch(':id')
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Update a label' })
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.updateLabelUseCase.execute(id, orgId, dto);
  }

  @Delete(':id')
  @RequireOrgRole(OrgRole.MEMBER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  async delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    await this.deleteLabelUseCase.execute(id, orgId);
  }
}
