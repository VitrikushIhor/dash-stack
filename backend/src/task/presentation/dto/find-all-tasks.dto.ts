import { IntersectionType } from '@nestjs/swagger';
import { FindAllTasksUnpaginatedDto } from './find-all-tasks-unpaginated.dto';
import { PaginationDto } from '../../../common/pagination/pagination.dto';

export class FindAllTasksDto extends IntersectionType(
  FindAllTasksUnpaginatedDto,
  PaginationDto,
) {}
