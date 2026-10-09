const quoteShellArgument = (value) => `'${value.replaceAll("'", "'\\''")}'`

const withFiles = (command) => (files) =>
  `${command} ${files.map(quoteShellArgument).join(' ')}`

export default {
  'frontend/**/*.{ts,tsx}': [
    withFiles('pnpm --dir frontend exec eslint --fix'),
    withFiles('pnpm --dir frontend exec prettier --write'),
    withFiles('pnpm --dir frontend exec vitest related --run --passWithNoTests'),
  ],
  'frontend/**/*.{js,jsx,json,css,md,yml,yaml}': withFiles(
    'pnpm --dir frontend exec prettier --write',
  ),
  'backend/**/*.ts': [
    withFiles('pnpm --dir backend exec eslint --fix'),
    withFiles('pnpm --dir backend exec prettier --write'),
  ],
  'backend/**/*.{js,mjs,cjs,json,css,md,yml,yaml}': withFiles(
    'pnpm --dir backend exec prettier --write',
  ),
  '*.{js,mjs,cjs,json,md,yml,yaml}': withFiles(
    'pnpm --dir frontend exec prettier --write',
  ),
  '.github/**/*.{yml,yaml}': withFiles('pnpm --dir frontend exec prettier --write'),
  '.vscode/**/*.json': withFiles('pnpm --dir frontend exec prettier --write'),
}
