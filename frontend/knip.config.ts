import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/app/**/page.tsx', 'src/app/layout.tsx', 'src/middleware.ts'],
  ignore: ['src/shared/ui/components/ui/**'],
  ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
};

export default config;