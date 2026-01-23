# NestJS Prisma Starter

Готовий стартовий шаблон для розробки REST API на **NestJS** з використанням **Prisma 7 ORM** та **PostgreSQL**.

## 🚀 Функціонал

- **Database**: PostgreSQL + Prisma 7 ORM (з pg adapter)
- **Authentication**: JWT авторизація (Access + Refresh tokens)
- **Security**: Helmet, Rate Limiting (Throttler), CORS
- **Logging**: Структуроване JSON логування (`nestjs-pino`) — умовне (production або `ENABLE_LOGS=true`)
- **Health Check**: `/api/health` ендпоінт для моніторингу
- **Documentation**: Swagger доступний за `/api/docs`
- **Docker**: Готові конфігурації для dev та production

## 🛠 Вимоги

- Node.js v20+
- Docker

## 🏁 Швидкий старт

### 1. Встановлення

```bash
npm install
```

### 2. Налаштування `.env`

```bash
cp .env.example .env
```

Основні змінні:

- `DATABASE_URL` — підключення до PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — секрети для токенів
- `PORT` — порт сервера (за замовчуванням `8000`)
- `ENABLE_LOGS` — увімкнути логи (`true`/`false`)

### 3. Запуск бази даних

```bash
docker-compose up postgres -d
```

### 4. Міграції

```bash
npx prisma migrate dev
```

### 5. Запуск сервера

```bash
# Режим розробки (локально)
npm run dev

# Продакшен
npm run start:prod
```

**API**: <http://localhost:8000/api>  
**Swagger**: <http://localhost:8000/api/docs>  
**Health**: <http://localhost:8000/api/health>

## 🐳 Docker

### Production

```bash
docker-compose up --build
```

### Development (з hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 🧪 Тестування

```bash
# Unit тести
npm test

# E2E тести
npm run test:e2e
```

## 📁 Структура

```text
src/
├── auth/      # Авторизація (JWT)
├── users/     # Користувачі
├── health/    # Health check
├── common/    # Спільні конфіги
prisma/        # Схема БД та міграції
```

## 🌐 Мови

- [🇬🇧 English](README.md)

## 👤 Автор

Vitrikush Ihor
