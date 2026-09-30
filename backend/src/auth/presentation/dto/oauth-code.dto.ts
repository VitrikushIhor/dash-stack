import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class OAuthCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  code: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43,128}$/)
  codeVerifier: string;
}
