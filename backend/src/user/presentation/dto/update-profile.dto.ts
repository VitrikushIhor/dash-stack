import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 'I am a backend developer.' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  bio?: string;

  @ApiPropertyOptional({
    example: ['https://example.com', 'https://github.com/johndoe'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  urls?: string[];

  @ApiPropertyOptional({
    description: 'Avatar key from storage (e.g. avatars/123.webp)',
    example: 'avatars/123.webp',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
