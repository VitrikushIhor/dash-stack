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
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { OrgRole } from '../../organization/domain/enums/org-role.enum';
import { TenantId } from '../../organization/presentation/decorators/tenant.decorator';
import { RequireTenantRole } from '../../organization/presentation/decorators/require-tenant-role.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../application/use-cases/delete-task.use-case';
import { BulkUpdateTaskStatusUseCase } from '../application/use-cases/bulk-update-task-status.use-case';
import { DeleteManyTasksUseCase } from '../application/use-cases/delete-many-tasks.use-case';
import { FindTaskByIdUseCase } from '../application/use-cases/find-task-by-id.use-case';
import { FindAllTasksUseCase } from '../application/use-cases/find-all-tasks.use-case';
import { FindAllTasksUnpaginatedUseCase } from '../application/use-cases/find-all-tasks-unpaginated.use-case';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindAllTasksDto } from './dto/find-all-tasks.dto';
import { FindAllTasksUnpaginatedDto } from './dto/find-all-tasks-unpaginated.dto';
import { BulkDeleteTasksDto, BulkUpdateTasksDto } from './dto/bulk-action.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskCommand } from '../application/commands/create-task.command';
import { UpdateTaskCommand } from '../application/commands/update-task.command';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('organizations/:slug/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly bulkUpdateTaskStatusUseCase: BulkUpdateTaskStatusUseCase,
    private readonly deleteManyTasksUseCase: DeleteManyTasksUseCase,
    private readonly findTaskByIdUseCase: FindTaskByIdUseCase,
    private readonly findAllTasksUseCase: FindAllTasksUseCase,
    private readonly findAllTasksUnpaginatedUseCase: FindAllTasksUnpaginatedUseCase,
  ) {}

  @Post()
  @RequireTenantRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Create a new task' })
  create(@TenantId() orgId: string, @Body() dto: CreateTaskDto) {
    const command: CreateTaskCommand = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      assigneeIds: dto.assigneeIds,
      attachments: dto.attachments,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      labelId: dto.labelId,
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
  @RequireTenantRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'List all tasks for an organization (paginated)' })
  findAll(@TenantId() orgId: string, @Query() dto: FindAllTasksDto) {
    return this.findAllTasksUseCase.execute(orgId, dto);
  }

  @Get('all')
  @RequireTenantRole(OrgRole.GUEST)
  @ApiOperation({
    summary: 'List all tasks for an organization without pagination',
  })
  findAllUnpaginated(@TenantId() orgId: string, @Query() dto: FindAllTasksUnpaginatedDto) {
    return this.findAllTasksUnpaginatedUseCase.execute(orgId, dto);
  }

  @Patch('bulk/update')
  @RequireTenantRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Bulk update tasks' })
  @ApiBody({ type: BulkUpdateTasksDto })
  async updateMany(@TenantId() orgId: string, @Body() dto: BulkUpdateTasksDto) {
    return this.bulkUpdateTaskStatusUseCase.execute(orgId, dto.ids, dto.status);
  }

  @Delete('bulk')
  @RequireTenantRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete tasks' })
  @ApiBody({ type: BulkDeleteTasksDto })
  async deleteMany(@TenantId() orgId: string, @Body() dto: BulkDeleteTasksDto) {
    await this.deleteManyTasksUseCase.execute(orgId, dto.ids);
  }

  @Get(':id')
  @RequireTenantRole(OrgRole.GUEST)
  @ApiOperation({ summary: 'Get task by ID' })
  findById(@TenantId() orgId: string, @Param('id') id: string) {
    return this.findTaskByIdUseCase.execute(id, orgId);
  }

  @Patch(':id')
  @RequireTenantRole(OrgRole.MEMBER)
  @ApiOperation({ summary: 'Update a task' })
  update(@TenantId() orgId: string, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const command: UpdateTaskCommand = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      assigneeIds: dto.assigneeIds,
      attachments: dto.attachments,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      labelId: dto.labelId,
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
  @RequireTenantRole(OrgRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  async delete(@TenantId() orgId: string, @Param('id') id: string) {
    await this.deleteTaskUseCase.execute(id, orgId);
  }
}
