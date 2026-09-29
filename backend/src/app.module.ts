import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { OrganizationModule } from './organization/organization.module';
import { InvitationModule } from './invitation/invitation.module';
import { TaskModule } from './task/task.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { LabelModule } from './label/label.module';
import { VocabModule } from './vocab/vocab.module';
import config from './common/configs/config';
import { validateAuthEnvironment } from './common/configs/auth-environment.validator';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { APP_GUARD } from '@nestjs/core';
import { CsrfOriginGuard } from './common/guards/csrf-origin.guard';
import {
  createHttpRequestId,
  serializeHttpRequest,
  serializeHttpResponse,
} from './common/configs/http-log-serializers';
import { databasePoolConfig } from './common/configs/database-pool-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env',
      validate: validateAuthEnvironment,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'images'),
      serveRoot: '/uploads/images',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get('DATABASE_URL');
        const poolConfig = databasePoolConfig(connectionString);

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
            genReqId: createHttpRequestId,
            customProps: () => ({
              context: 'HTTP',
            }),
            serializers: { req: serializeHttpRequest, res: serializeHttpResponse },
            redact: ['req.headers.authorization', 'req.body.password', 'req.body.newPassword'],
            transport: isProduction
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
          },
        };
      },
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 10,
    //   },
    // ]),

    AuthModule,
    HealthModule,
    EmailModule,
    OrganizationModule,
    InvitationModule,
    TaskModule,
    StorageModule,
    UserModule,
    LabelModule,
    VocabModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: CsrfOriginGuard },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
