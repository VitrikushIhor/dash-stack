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
    files: ['./src/shared/ui/core/**'],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    files: [
      './src/entities/team/**',
      './src/entities/team',
      './src/widgets/tasks-table/**',
      './src/widgets/tasks-table',
      './src/features/manage-task/**',
      './src/features/manage-task',
    ],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/features/auth/ui/auth-layout.tsx'],
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
]);
