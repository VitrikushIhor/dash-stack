# Dash Stack Frontend

Production-ready React application built with modern technologies and Feature-Sliced Design architecture.

## 🚀 Tech Stack

- **Framework**: React 19 + TypeScript
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI + Shadcn/ui
- **Build Tool**: Vite
- **Architecture**: Feature-Sliced Design (FSD)

## 📁 Project Structure

```
src/
├── app/          # App shell (providers, routing, init, styles)
├── pages/        # Route-level compositions
├── widgets/      # Page fragments composed from features/entities
├── features/     # User-visible interactions (use cases)
├── entities/     # Business entities
└── shared/       # UI kit, libs, utils, config
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run knip` - Find unused files and dependencies
- `npm run audit` - Check for security vulnerabilities

## 🏗️ Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🔒 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_API_URL=your_api_url
VITE_APP_NAME=Your App Name
```

## 🧪 Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

### Pre-commit Hooks

Before each commit, the following checks run automatically:

- ESLint fixes
- Prettier formatting
- Type checking (on push)

## 🏛️ Architecture (Feature-Sliced Design)

This project follows [Feature-Sliced Design](https://feature-sliced.design/) principles:

- **app/** - Application initialization, providers, routing
- **pages/** - Route-level page compositions
- **widgets/** - Complex UI compositions
- **features/** - User interactions (use cases)
- **entities/** - Business entities
- **shared/** - Reusable UI components, utilities, configs

### Import Rules

- Layers can only import from lower layers
- No circular dependencies
- Use barrel exports (index.ts) for public API

## 📦 Dependencies

### Production

- React 19
- TanStack Router, Query, Table
- Zustand
- React Hook Form
- Zod
- TailwindCSS
- Radix UI

### Development

- TypeScript
- ESLint
- Prettier
- Husky
- Vite

## 🔐 Security

- Regular security audits: `npm run audit`
- Environment variables for sensitive data
- No secrets in version control

## 🚢 Deployment

### Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Environment Setup

Ensure all environment variables are set in your deployment platform.

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all checks pass (`npm run lint`, `npm run type-check`)
4. Commit your changes (pre-commit hooks will run automatically)
5. Push and create a Pull Request

## 📄 License

[Your License Here]

## 👥 Team

[Your Team Info Here]
