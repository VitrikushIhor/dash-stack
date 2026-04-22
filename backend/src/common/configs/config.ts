import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: parseInt(process.env.PORT || '8000', 10),
  },
  cors: {
    enabled: true,
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'],
    credentials: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs ',
    description: 'The nestjs API description',
    version: '1.0',
    path: 'api/docs',
  },
  security: {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '2m',
    refreshIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    bcryptSaltOrRound: 10,
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || 'your_email@gmail.com',
    pass: process.env.SMTP_PASS || 'app_password',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

export default (): Config => config;
