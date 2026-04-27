import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './services/task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindAllTasksDto } from './dto/find-all-tasks.dto';
import { BulkUpdateTasksDto, BulkDeleteTasksDto } from './dto/bulk-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../common/guards/membership-role.guard';
import { OrgRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('organizations/:orgId/tasks')
@UseGuards(JwtAuthGuard, MembershipRoleGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Create a new task' })
  create(@Param('orgId') orgId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.create(orgId, dto);
  }

  @Get()
  @RequireOrgRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'List all tasks for an organization' })
  findAll(@Param('orgId') orgId: string, @Query() dto: FindAllTasksDto) {
    return this.taskService.findAll(orgId, dto);
  }

  @Patch('bulk/update')
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Bulk update tasks' })
  async updateMany(
    @Param('orgId') orgId: string,
    @Body() dto: BulkUpdateTasksDto,
  ) {
    return this.taskService.updateMany(orgId, dto.ids, { status: dto.status });
  }

  @Delete('bulk')
  @RequireOrgRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete tasks' })
  async deleteMany(
    @Param('orgId') orgId: string,
    @Body() dto: BulkDeleteTasksDto,
  ) {
    await this.taskService.deleteMany(orgId, dto.ids);
  }

  @Get(':id')
  @RequireOrgRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'Get task by ID' })
  findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.taskService.findById(id, orgId);
  }

  @Patch(':id')
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, orgId, dto);
  }

  @Delete(':id')
  @RequireOrgRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  async delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    await this.taskService.delete(id, orgId);
  }
}
