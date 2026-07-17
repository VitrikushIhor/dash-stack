# NestJS Prisma Starter

A production-ready starter template for building REST APIs with **NestJS**, **Prisma 7 ORM**, and **PostgreSQL**.

## 🚀 Features

- **Database**: PostgreSQL + Prisma 7 ORM (with pg adapter)
- **Authentication**: JWT (Access + Refresh tokens)
- **Security**: Helmet, Rate Limiting (Throttler), CORS
- **Logging**: Structured JSON logging (`nestjs-pino`) — conditional (production or `ENABLE_LOGS=true`)
- **Health Check**: `/api/health` endpoint for monitoring
- **Documentation**: Swagger available at `/api/docs`
- **Docker**: Ready configurations for dev and production

## 🛠 Requirements

- Node.js v20+
- Docker

## 🏁 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configure `.env`

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — token secrets
- `PORT` — server port (default `8000`)
- `ENABLE_LOGS` — enable logging (`true`/`false`)

### 3. Start Database

```bash
docker-compose up postgres -d
```

### 4. Run Migrations

```bash
npx prisma migrate dev
```

### 5. Start Server

```bash
# Development mode (local)
npm run dev

# Production
npm run start:prod
```

**API**: http://localhost:8000/api  
**Swagger**: http://localhost:8000/api/docs  
**Health**: http://localhost:8000/api/health

## 🐳 Docker

### Production

```bash
docker-compose up --build
```

### Development (with hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## 📁 Structure

```
src/
├── auth/      # Authentication (JWT)
├── users/     # Users module
├── health/    # Health check
├── common/    # Shared configs
prisma/        # DB schema & migrations
```

## 🌐 Languages

- [🇺🇦 Українська](README.ua.md)

## 👤 Author

Vitrikush Ihor
