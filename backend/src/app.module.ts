import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { OrganizationModule } from './organization/organization.module';
import { InvitationModule } from './invitation/invitation.module';
import { TaskModule } from './task/task.module';
import { StorageModule } from './storage/storage.module';
import config from './common/configs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: ['.env', '../.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get('DATABASE_URL');
        const poolConfig: any = { connectionString };

        // Parse schema from URL and set it as search_path in Pool options
        try {
          if (connectionString) {
            const url = new URL(connectionString);
            const schema = url.searchParams.get('schema');
            if (schema) {
              poolConfig.options = `-c search_path=${schema}`;
              console.log(
                `[AppModule] Configured Postgres search_path to: ${schema}`,
              );
            }
          }
        } catch (e) {
          console.warn('Failed to parse DATABASE_URL configuration', e);
        }

        const pool = new Pool(poolConfig);
        const adapter = new PrismaPg(pool);

        return {
          explicitConnect: false,
          prismaOptions: {
            adapter,
          },
        };
      },
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const enableLogs = configService.get('ENABLE_LOGS') === 'true';

        return {
          pinoHttp: {
            level: isProduction || enableLogs ? 'info' : 'silent',
            autoLogging: isProduction || enableLogs, // Explicitly disable autoLogging
            customProps: () => ({
              context: 'HTTP',
            }),
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            },
          },
          // Attempt to fix /api/* warning by using named wildcard
          forRoutes: ['/api/*path'],
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    AuthModule,
    UsersModule,
    HealthModule,
    EmailModule,
    OrganizationModule,
    InvitationModule,
    TaskModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
