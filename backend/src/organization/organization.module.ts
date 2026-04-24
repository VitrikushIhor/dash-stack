import { Module } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './repositories/organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService],
})
export class OrganizationModule {}
