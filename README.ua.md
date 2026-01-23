# 🚀 Dash Stack

Сучасний full-stack monorepo з React frontend та NestJS backend.

![CI](https://github.com/VitrikushIhor/dash-stack/actions/workflows/ci.yml/badge.svg)

> 🇬🇧 [English version](README.md)

## 📦 Стек технологій

### Frontend
- **React 19** + TypeScript
- **Vite** - швидкий build tool
- **TanStack Router** - type-safe routing
- **TanStack Query** - data fetching
- **Tailwind CSS 4** - styling
- **Radix UI** - accessible components
- **Vitest** - unit testing

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - database
- **Passport.js** - authentication
- **Swagger** - API documentation
- **Jest** - testing

### DevOps
- **Docker & Docker Compose** - containerization
- **GitHub Actions** - CI/CD
- **Husky** - git hooks
- **npm Workspaces** - monorepo management

---

## 🛠 Початок роботи

### Вимоги

- Node.js 20+
- npm 10+
- Docker & Docker Compose (для бази даних)

### 1. Клонування репозиторію

```bash
git clone https://github.com/VitrikushIhor/dash-stack.git
cd dash-stack
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних середовища

```bash
cp .env.example .env
```

Відредагуйте `.env` файл за потреби.

### 4. Запуск бази даних

```bash
npm run docker:dev
```

Або тільки PostgreSQL:

```bash
docker-compose -f docker-compose.dev.yml up postgres -d
```

### 5. Міграції бази даних

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 6. Запуск в режимі розробки

```bash
# В окремих терміналах:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8000
```

---

## 📜 Доступні команди

### Розробка

| Команда | Опис |
|---------|------|
| `npm run dev:frontend` | Запуск frontend dev сервера |
| `npm run dev:backend` | Запуск backend dev сервера |

### Тестування

| Команда | Опис |
|---------|------|
| `npm run test -w frontend` | Запуск frontend тестів |
| `npm run test:watch -w frontend` | Frontend тести в watch mode |
| `npm run test:coverage -w frontend` | Frontend тести з покриттям |
| `npm run test -w backend` | Запуск backend тестів |
| `npm run test:e2e -w backend` | Backend e2e тести |

### Лінтинг та форматування

| Команда | Опис |
|---------|------|
| `npm run lint` | Лінтинг обох проектів |
| `npm run lint:frontend` | Лінтинг frontend |
| `npm run lint:backend` | Лінтинг backend |
| `npm run format:frontend` | Форматування frontend |
| `npm run format:backend` | Форматування backend |

### Build

| Команда | Опис |
|---------|------|
| `npm run build:frontend` | Production build frontend |
| `npm run build:backend` | Production build backend |

### Docker

| Команда | Опис |
|---------|------|
| `npm run docker:up` | Запуск production контейнерів |
| `npm run docker:up:build` | Rebuild і запуск |
| `npm run docker:down` | Зупинка контейнерів |
| `npm run docker:dev` | Запуск dev контейнерів з hot-reload |
| `npm run docker:dev:build` | Rebuild і запуск dev |
| `npm run docker:logs` | Перегляд логів |
| `npm run docker:ps` | Статус контейнерів |

---

## 🐳 Docker

### Development (з hot-reload)

```bash
npm run docker:dev:build
```

Сервіси:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

### Production

```bash
npm run docker:up:build
```

Сервіси:
- Frontend: http://localhost:80
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

---

## 📁 Структура проекту

```
dash-stack/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI
├── .husky/                  # Git hooks
├── frontend/                # React додаток
│   ├── src/
│   │   ├── app/            # App-level config, routes
│   │   ├── entities/       # Business entities
│   │   ├── features/       # Feature modules
│   │   ├── pages/          # Page components
│   │   ├── shared/         # Shared UI, utils, hooks
│   │   ├── widgets/        # Complex UI blocks
│   │   └── test/           # Test utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # NestJS API
│   ├── src/
│   ├── prisma/             # Database schema & migrations
│   ├── test/               # E2E tests
│   └── package.json
├── docker-compose.yml       # Production Docker
├── docker-compose.dev.yml   # Development Docker
├── package.json            # Root package.json (workspaces)
└── README.md
```

---

## 🔐 API Документація

Swagger UI доступний за адресою:

```
http://localhost:8000/api
```

---

## 🧪 Тестування

### Frontend (Vitest)

```bash
# Запуск тестів
npm run test -w frontend

# Watch mode
npm run test:watch -w frontend

# Coverage report
npm run test:coverage -w frontend
```

### Backend (Jest)

```bash
# Unit тести
npm run test -w backend

# E2E тести
npm run test:e2e -w backend

# Coverage
npm run test:cov -w backend
```

---

## 🔄 CI/CD

GitHub Actions автоматично запускає:

1. **Lint & Type Check** - ESLint, TypeScript
2. **Build** - Production builds
3. **Tests** - Unit та E2E тести
4. **Security Audit** - npm audit
5. **Docker Build** - Перевірка Docker images

CI запускається тільки для змінених частин проекту (paths filter).

---

## 📝 Git Workflow

### Commit Hooks (Husky)

- **pre-commit**: lint-staged (ESLint + Prettier)

### Branches

- `main` - production
- `develop` - development
- `feature/*` - нові фічі
- `fix/*` - баг фікси

---

## 🤝 Contributing

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Commit зміни (`git commit -m 'Add amazing feature'`)
4. Push до branch (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

---

## 👤 Автор

**Vitrikush Ihor**

- GitHub: [@VitrikushIhor](https://github.com/VitrikushIhor)
