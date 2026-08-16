import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName?: string | null;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string | null;

  @ApiPropertyOptional({ example: 'I am a backend developer.' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  bio?: string | null;

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
  avatar?: string | null;
}
