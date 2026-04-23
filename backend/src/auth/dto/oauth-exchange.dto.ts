import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthExchangeDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
