import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
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
      './src/features/checklist/**',
      './src/features/checklist',
      './src/widgets/calendar-view/**',
      './src/widgets/calendar-view',
      './src/widgets/kanban-board/**',
      './src/widgets/kanban-board',
      './src/widgets/tasks-table/**',
      './src/widgets/tasks-table',
      './src/features/event-calendar/**',
      './src/features/event-calendar',
      './src/features/task/**',
      './src/features/task',
      './src/features/manage-task/**',
      './src/features/manage-task'
    ],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: [
      './src/features/auth/ui/auth-layout.tsx'
    ],
    rules: {
      'fsd/no-public-api-sidestep': 'off'
    }
  }
]);
