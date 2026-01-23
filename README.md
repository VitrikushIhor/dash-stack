# 🚀 Dash Stack

Modern full-stack monorepo with React frontend and NestJS backend.

![CI](https://github.com/VitrikushIhor/dash-stack/actions/workflows/ci.yml/badge.svg)

> 🇺🇦 [Українська версія](README.ua.md)

## 📦 Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite** - fast build tool
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

## 🛠 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for database)

### 1. Clone the repository

```bash
git clone https://github.com/VitrikushIhor/dash-stack.git
cd dash-stack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file as needed.

### 4. Start the database

```bash
npm run docker:dev
```

Or just PostgreSQL:

```bash
docker-compose -f docker-compose.dev.yml up postgres -d
```

### 5. Run database migrations

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 6. Start development servers

```bash
# In separate terminals:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8000
```

---

## 📜 Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start frontend dev server |
| `npm run dev:backend` | Start backend dev server |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test -w frontend` | Run frontend tests |
| `npm run test:watch -w frontend` | Frontend tests in watch mode |
| `npm run test:coverage -w frontend` | Frontend tests with coverage |
| `npm run test -w backend` | Run backend tests |
| `npm run test:e2e -w backend` | Backend e2e tests |

### Linting & Formatting

| Command | Description |
|---------|-------------|
| `npm run lint` | Lint both projects |
| `npm run lint:frontend` | Lint frontend |
| `npm run lint:backend` | Lint backend |
| `npm run format:frontend` | Format frontend |
| `npm run format:backend` | Format backend |

### Build

| Command | Description |
|---------|-------------|
| `npm run build:frontend` | Production build frontend |
| `npm run build:backend` | Production build backend |

### Docker

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start production containers |
| `npm run docker:up:build` | Rebuild and start |
| `npm run docker:down` | Stop containers |
| `npm run docker:dev` | Start dev containers with hot-reload |
| `npm run docker:dev:build` | Rebuild and start dev |
| `npm run docker:logs` | View logs |
| `npm run docker:ps` | Container status |

---

## 🐳 Docker

### Development (with hot-reload)

```bash
npm run docker:dev:build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

### Production

```bash
npm run docker:up:build
```

Services:
- Frontend: http://localhost:80
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

---

## 📁 Project Structure

```
dash-stack/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI
├── .husky/                  # Git hooks
├── frontend/                # React application
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

## 🔐 API Documentation

Swagger UI is available at:

```
http://localhost:8000/api
```

---

## 🧪 Testing

### Frontend (Vitest)

```bash
# Run tests
npm run test -w frontend

# Watch mode
npm run test:watch -w frontend

# Coverage report
npm run test:coverage -w frontend
```

### Backend (Jest)

```bash
# Unit tests
npm run test -w backend

# E2E tests
npm run test:e2e -w backend

# Coverage
npm run test:cov -w backend
```

---

## 🔄 CI/CD

GitHub Actions automatically runs:

1. **Lint & Type Check** - ESLint, TypeScript
2. **Build** - Production builds
3. **Tests** - Unit and E2E tests
4. **Security Audit** - npm audit
5. **Docker Build** - Verify Docker images

CI only runs for changed parts of the project (paths filter).

---

## 📝 Git Workflow

### Commit Hooks (Husky)

- **pre-commit**: lint-staged (ESLint + Prettier)

### Branches

- `main` - production
- `develop` - development
- `feature/*` - new features
- `fix/*` - bug fixes

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author

**Vitrikush Ihor**

- GitHub: [@VitrikushIhor](https://github.com/VitrikushIhor)
