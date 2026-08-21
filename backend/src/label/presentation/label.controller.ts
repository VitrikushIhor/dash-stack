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
import { OrgRole } from '../../organization/domain/enums/org-role.enum';
import { TenantId } from '../../organization/presentation/decorators/tenant.decorator';
import { RequireTenantRole } from '../../organization/presentation/decorators/require-tenant-role.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateLabelUseCase } from '../application/use-cases/create-label.use-case';
import { UpdateLabelUseCase } from '../application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from '../application/use-cases/delete-label.use-case';
import { FindAllLabelsUseCase } from '../application/use-cases/find-all-labels.use-case';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('organizations/:slug/labels')
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
    private readonly findAllLabelsUseCase: FindAllLabelsUseCase,
  ) {}

  @Post()
  @RequireTenantRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Create a new label' })
  create(@TenantId() orgId: string, @Body() dto: CreateLabelDto) {
    return this.createLabelUseCase.execute(orgId, dto);
  }

  @Get()
  @RequireTenantRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'List all labels for an organization' })
  findAll(@TenantId() orgId: string) {
    return this.findAllLabelsUseCase.execute(orgId);
  }

  @Patch(':id')
  @RequireTenantRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Update a label' })
  update(@TenantId() orgId: string, @Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.updateLabelUseCase.execute(id, orgId, dto);
  }

  @Delete(':id')
  @RequireTenantRole(OrgRole.MEMBER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  async delete(@TenantId() orgId: string, @Param('id') id: string) {
    await this.deleteLabelUseCase.execute(id, orgId);
  }
}
