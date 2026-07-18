import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  IsEmail,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John' })
  @ValidateIf((o) => o.firstName !== null)
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName: string | null;

  @ApiProperty({ example: 'Doe' })
  @ValidateIf((o) => o.lastName !== null)
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName: string | null;

  @ApiProperty({ example: '1990-01-01' })
  @ValidateIf((o) => o.dob !== null)
  @IsDateString()
  dob: string | null;

  @ApiProperty({ example: 'I am a backend developer.' })
  @ValidateIf((o) => o.bio !== null)
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  bio: string | null;

  @ApiProperty({
    example: ['https://example.com', 'https://github.com/johndoe'],
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  urls: string[];

  @ApiProperty({
    description: 'Avatar key from storage (e.g. avatars/123.webp)',
    example: 'avatars/123.webp',
  })
  @ValidateIf((o) => o.avatar !== null)
  @IsString()
  avatar: string | null;
}
