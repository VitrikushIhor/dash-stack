import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus'; // npm install @nestjs/terminus
import { HttpModule } from '@nestjs/axios'; // Terminus internal dependency often needs HttpModule
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
