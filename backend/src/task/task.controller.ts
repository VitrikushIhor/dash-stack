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
  ParseEnumPipe,
} from '@nestjs/common';
import { TaskService } from './services/task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../common/guards/membership-role.guard';
import { OrgRole, TaskStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

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
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'assigneeId', type: String, required: false })
  findAll(
    @Param('orgId') orgId: string,
    @Query('status', new ParseEnumPipe(TaskStatus, { optional: true }))
    status?: TaskStatus,
    @Query('assigneeId') assigneeId?: string,
  ) {
    return this.taskService.findAll(orgId, { status, assigneeId });
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
