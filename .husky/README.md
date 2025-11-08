# Husky Git Hooks

Цей проект використовує [Husky](https://typicode.github.io/husky/) для автоматизації перевірок перед commit та push.

## Доступні hooks

### Pre-commit
- **Файл**: `.husky/pre-commit`
- **Що робить**: Запускає `lint-staged` для перевірки та форматування змінених файлів
- **Перевірки**:
  - ESLint для TypeScript/JavaScript файлів
  - Prettier для форматування всіх файлів

### Pre-push
- **Файл**: `.husky/pre-push`
- **Що робить**: Запускає type checking перед push
- **Перевірки**:
  - TypeScript type checking (`tsc --noEmit`)

### Commit-msg
- **Файл**: `.husky/commit-msg`
- **Що робить**: Зарезервовано для майбутньої інтеграції з commitlint (опціонально)

## Як це працює

1. При `git commit` автоматично запускається `lint-staged`
2. `lint-staged` перевіряє тільки змінені файли
3. ESLint виправляє помилки автоматично (якщо можливо)
4. Prettier форматує код
5. Якщо є помилки, commit блокується

## Обхід перевірок (не рекомендується)

Якщо потрібно зробити commit без перевірок (наприклад, для merge commit):

```bash
git commit --no-verify
```

**⚠️ Увага**: Використовуйте тільки в крайніх випадках!

