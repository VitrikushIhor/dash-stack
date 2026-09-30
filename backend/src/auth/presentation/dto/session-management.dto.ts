import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { Type } from 'class-transformer';
import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class SessionListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  page: number = 1;
}

export class SessionIdDto {
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  id: string;
}

export class SessionListResponseDto {
  data: {
    id: string;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    userAgent: string | null;
    isCurrent: boolean;
  }[];
  meta: PaginatedResult<unknown>['meta'];
}

export class RevokeSessionResponseDto {
  revokedCurrentSession: boolean;
}
