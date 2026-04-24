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
import { TaskService } from './services/task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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
  findAll(@Param('orgId') orgId: string) {
    return this.taskService.findAll(orgId);
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
  @ApiOperation({ summary: 'Delete a task' })
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.taskService.delete(id, orgId);
  }
}
