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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../../common/guards/membership-role.guard';
import { OrgRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';
import { BulkUpdateTaskStatusUseCase } from '../application/use-cases/bulk-update-task-status.use-case';
import { DeleteManyTasksUseCase } from '../application/use-cases/delete-many-tasks.use-case';
import { FindTaskByIdUseCase } from '../application/use-cases/find-task-by-id.use-case';
import { FindAllTasksUseCase } from '../application/use-cases/find-all-tasks.use-case';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindAllTasksDto } from './dto/find-all-tasks.dto';
import { BulkDeleteTasksDto, BulkUpdateTasksDto } from './dto/bulk-action.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskCommand } from '../application/commands/create-task.command';
import { UpdateTaskCommand } from '../application/commands/update-task.command';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('organizations/:orgId/tasks')
@UseGuards(JwtAuthGuard, MembershipRoleGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly bulkUpdateTaskStatusUseCase: BulkUpdateTaskStatusUseCase,
    private readonly deleteManyTasksUseCase: DeleteManyTasksUseCase,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
    private readonly findAllTasksUseCase: FindAllTasksUseCase,
  ) {}

  @Post()
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Create a new task' })
  create(@Param('orgId') orgId: string, @Body() dto: CreateTaskDto) {
    const command: CreateTaskCommand = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      assigneeIds: dto.assigneeIds,
      attachments: dto.attachments,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      label: dto.label,
      checklists: dto.checklists?.map((cl) => ({
        name: cl.name,
        items: cl.items.map((item) => ({
          text: item.title,
          completed: item.completed,
        })),
      })),
    };
    return this.createTaskUseCase.execute(orgId, command);
  }

  @Get()
  @RequireOrgRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'List all tasks for an organization' })
  findAll(@Param('orgId') orgId: string, @Query() dto: FindAllTasksDto) {
    return this.findAllTasksUseCase.execute(orgId, {
      search: dto.search,
      status: dto.status,
      assigneeIds: dto.assigneeIds,
      labelNames: dto.labelNames,
      dueDateFrom: dto.dueDateFrom,
      dueDateTo: dto.dueDateTo,
      startDateFrom: dto.startDateFrom,
      startDateTo: dto.startDateTo,
    });
  }

  @Patch('bulk/update')
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Bulk update tasks' })
  @ApiBody({ type: BulkUpdateTasksDto })
  async updateMany(
    @Param('orgId') orgId: string,
    @Body() dto: BulkUpdateTasksDto,
  ) {
    return this.bulkUpdateTaskStatusUseCase.execute(orgId, dto.ids, dto.status);
  }

  @Delete('bulk')
  @RequireOrgRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete tasks' })
  @ApiBody({ type: BulkDeleteTasksDto })
  async deleteMany(
    @Param('orgId') orgId: string,
    @Body() dto: BulkDeleteTasksDto,
  ) {
    await this.deleteManyTasksUseCase.execute(orgId, dto.ids);
  }

  @Get(':id')
  @RequireOrgRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'Get task by ID' })
  findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.findTaskByIdUseCase.execute(id, orgId);
  }

  @Patch(':id')
  @RequireOrgRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const command: UpdateTaskCommand = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      assigneeIds: dto.assigneeIds,
      attachments: dto.attachments,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      label: dto.label,
      checklists: dto.checklists?.map((cl) => ({
        name: cl.name,
        items: cl.items.map((item) => ({
          text: item.title,
          completed: item.completed,
        })),
      })),
    };
    return this.updateTaskUseCase.execute(id, orgId, command);
  }

  @Delete(':id')
  @RequireOrgRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  async delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    await this.deleteTaskUseCase.execute(id, orgId);
  }
}
