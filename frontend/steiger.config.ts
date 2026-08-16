import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/app/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    files: ['./src/widgets/**', './src/features/**', './src/entities/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/shared/ui/core', './src/shared/ui/core/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    files: ['./src/shared/lib/test', './src/shared/lib/test/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },

  {
    files: [
      './src/**/*.action.ts',
      './src/**/*.action.test.ts',
      './src/**/*.server.ts',
      './src/**/*.server.tsx',
      './src/**/*.test.ts',
      './src/**/*.test.tsx',
      './src/**/*.spec.ts',
      './src/**/*.spec.tsx',
      './src/widgets/**',
      './src/views/**',
      './src/features/**',
      './src/entities/**',
    ],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
]);



