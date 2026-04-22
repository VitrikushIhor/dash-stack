import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: 'some-refresh-token',
    description: 'Refresh token to blacklist',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
