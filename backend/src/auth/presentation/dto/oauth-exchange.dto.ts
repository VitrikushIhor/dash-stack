import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthExchangeDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1VTkJS...',
    description: 'Auth0 access token to exchange for JWT tokens',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
