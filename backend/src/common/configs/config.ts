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
};

export default (): Config => config;
