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
import config from './common/configs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.get('DATABASE_URL'),
        });
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
