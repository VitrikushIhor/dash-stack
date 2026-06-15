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
]);
