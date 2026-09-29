# ADR-0003: Invitation як одноразовий bearer credential

Статус: реалізовано в коді; реальні PostgreSQL/SMTP/browser acceptance ще не виконані.

## Контекст

Invitation token створювався Prisma `cuid()`, зберігався відкритим у БД і повертався у відповідях create/list. Backend accept передавав token у URL path, який можуть записувати HTTP access logs. Лист вів на застарілий шлях `/invite/accept` замість наявного `/accept-invite`.

## Рішення

- Репозиторій генерує 32 криптографічно випадкові байти та передає raw base64url token лише поштовому use-case. Наявне поле `Invitation.token` зберігає SHA-256 digest; пошук виконується за digest після перевірки формату. Schema change не потрібен.
- Публічна invitation read model не має ні raw token, ні digest. `POST /invitations/accept` приймає token у валідованому JSON body, тому backend request URL його не містить.
- Email веде на `/accept-invite?token=…`. Middleware виставляє `Referrer-Policy: no-referrer` для invitation/sign-in/reset/verify сторінок і відповідних redirects. Початковий email URL усе ще містить bearer credential, тому його не можна логувати або поширювати.
- Якщо SMTP повертає помилку, use-case умовно видаляє щойно створений pending invitation для повторної спроби. Якщо cleanup теж падає, повертається окрема помилка часткового результату. SMTP acknowledgment не доводить фактичну доставку, а timeout може статись після прийняття листа сервером; у такому випадку отримане посилання може бути вже недійсним, і потрібно повторне запрошення.

## Сумісність і перевірка

Старі локальні CUID invitation links не приймаються новим lookup. Проєкт ще не розгорнутий, дані тестові; міграція старих bearer credentials не виконується. Перед production потрібні direct HTTP, PostgreSQL accept/revoke race, реальний SMTP та браузерні перевірки переходу з листа, входу й прийняття invitation.
