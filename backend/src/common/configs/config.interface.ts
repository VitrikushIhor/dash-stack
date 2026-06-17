export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  security: SecurityConfig;
  email: EmailConfig;
  storage: StorageConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  credentials: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  frontendUrl: string;
}

export interface StorageConfig {
  provider: string;
  s3Bucket: string;
  s3Region: string;
  accessKeyId: string;
  secretAccessKey: string;
  cloudfrontDomain: string;
}
