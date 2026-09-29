import { IsIn } from 'class-validator';
import { OAuthCodeDto } from './oauth-code.dto';
import { LINKABLE_OAUTH_PROVIDERS } from '../../domain/policies/oauth-identity.policy';

export class LinkOAuthCodeDto extends OAuthCodeDto {
  @IsIn(LINKABLE_OAUTH_PROVIDERS)
  provider: string;
}
