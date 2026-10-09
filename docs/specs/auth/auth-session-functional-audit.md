# Функціональний аудит authentication, authorization та lifecycle сесії

Дата: 2026-09-24. Поточна гілка `dev`, commit `02b66278` (Vocabulary merge). Режим: **лише аудит**, без виправлень, міграцій, оновлень залежностей, commit/push. Попередній security-аудит стосувався іншого commit `6e66522d`; його результати не є runtime-доказом для поточної версії.

## Висновок для описаного багу

**Баг підтверджено. Refresh існує лише у `/api/proxy`, але SSR та Server Actions звертаються до NestJS напряму через `serverApi`.** Цей клієнт читає тільки access cookie, не читає refresh cookie і не відновлює сесію після 401. Тому валідний refresh token не допомагає при прямому відкритті захищеної сторінки або відправленні server action після закінчення access token.

Додаткова причина неможливості нормально перезайти: middleware вважає наявність будь-якої auth cookie ознакою входу. Вхід зі старими cookies перенаправляється на `/organizations`, а серверне завантаження там знову отримує 401 без refresh. У runtime це завершилося сторінкою 500. Очищення cookies або новий логін може тимчасово прибрати симптом, але не усуває причину.

Є ще незалежний збій: конкурентні BFF-запити виконують кілька refresh одного токена. У відтвореному розкладі успішна відповідь встановила нові cookies, а пізні відповіді про використаний refresh видалили їх.

## Метод і межі доказів

1. Перечитано поточні serverApi/http-core, BFF route, middleware, auth actions/hooks, guards, auth use cases, repositories, token generator, JWT strategy та tenant guards. Backend auth/invitation/user/storage і перевірені task use cases/repository не змінилися від baseline попереднього аудиту (`git diff 6e66522d HEAD` для цих шляхів порожній).
2. Запущено **справжній поточний Next.js dev server** на окремому порту 13000. Контрольований HTTP upstream на 18000 задавав 401/200/503, одноразову ротацію та порядок відповідей. Це перевіряє реальні Next route handlers, SSR, middleware, Server Actions і browser cookie jar, але НЕ доводить роботу PostgreSQL/Auth0.
3. Chromium/Playwright у нових ізольованих контекстах відкривав сторінки, дочікувався завершеного UI, надсилав форму. BFF-запити також виконано через Playwright APIRequestContext зі спільним cookie jar.
4. Окремий Nest TestModule слухав HTTP на 18001: реальні JwtStrategy, JwtAuthGuard, DomainExceptionFilter, ResolveTenantContextGuard, RequireRoleGuard та їх use cases; сховища користувачів/членства ізольовані в пам’яті. Реальні RefreshTokenUseCase, JwtTokenGeneratorAdapter, LogoutUseCase і LogoutAllUseCase перевірено з атомарним delete-портом у пам’яті.
5. Жодних реальних облікових даних чи даних користувачів у тестах. Жодних записів у робочу БД, відправлення email або Auth0 login. Всі test credentials синтетичні. Службові скрипти розташовані в `/tmp`, production code не змінювався.

## BLOCKERS — функціональні знахідки

| ID | Пріоритет | Сценарій і фактичний результат | Причина / джерело |
| --- | --- | --- | --- |
| SESSION-01 | P1 | Невалідний access + придатний refresh → `/vocab/settings` завершується 401 UI; upstream отримав тільки GET /me, refresh не викликано | `frontend/src/shared/api/server-api-client.ts:13`; `frontend/src/entities/user/model/guards/authentication-guards.server.ts:7` |
| SESSION-02 | P1 | Профіль відкрито з valid access, cookie замінено на expired, натиснуто Update profile → PATCH /me з invalid access; action повернув Unauthorized, refresh не викликано | той самий serverApi; `frontend/src/features/update-profile/api/update-profile.action.ts:10`. HTTP 200 транспорту Server Action не означає успіх операції |
| SESSION-03 | P1 | `/sign-in` зі stale cookies → `/organizations` → 500 UI; cookies не очищені, refresh не викликано | `frontend/src/middleware.ts:38`, `:60`; organization guard напряму викликає serverApi |
| SESSION-04 | P1 | Три паралельні BFF /me з invalid access: результати 200/401/401, три refresh, фінальний cookie jar порожній | `frontend/src/app/api/proxy/[...path]/route.ts:132`, `:217`. Відтворення з контрольованим upstream; real DB interleaving ще не перевірений |
| SESSION-05 | P2 | GET /me → 401, refresh → 503, BFF повертає 401, зберігши cookies | `route.ts:224`; `frontend/src/shared/api/api-client.ts:12` трактує protected 401 як Session expired і переводить на login. `use-current-user.ts` трактує /me 401 як guest. Тимчасовий збій маскується під втрату автентифікації |

### Очікувана поведінка, яку потрібно перевіряти при майбутньому виправленні

- Valid refresh відновлює сесію при SSR, client API та Server Actions; користувач не втрачає введені дані і контекст сторінки.
- Server Component не повинен сам намагатися встановити cookies у read-only render: потрібна дозволена HTTP/Action межа, яка відновить сесію і повторить навігацію. Просте копіювання BFF refresh у serverApi не є завершеним рішенням.
- Один використаний refresh не видає два незалежних наступники; одночасні запити/вкладки не стирають нову сесію пізньою відмовою. Single-flight одного процесу не вирішує багатопроцесне розгортання сам по собі.
- 503/timeout refresh означає тимчасову недоступність з retry, а не guest/expired session.
- Остаточно відкликаний refresh дозволяє перейти на login без redirect-пастки.
- Повтор мутації дозволений лише коли авторизаційна відмова гарантовано сталася до виконання операції. У перевірених Nest protected routes JWT guards виконуються до handler; доказу подвійного запису через післяопераційний 401 не знайдено.

## Матриця runtime-перевірок

| Перевірка | Результат | Рівень доказу |
| --- | --- | --- |
| BFF invalid access + valid refresh | 200, один refresh, повтор із fresh access, дві cookies ротовані | Реальний Next HTTP + контрольований upstream |
| BFF відсутній access + valid refresh | 200, ротація працює | Те саме |
| SSR invalid access + valid refresh | 401 UI, 0 refresh | Реальний Chromium + Next SSR |
| SSR тільки refresh cookie | GET /me без Authorization; 0 refresh; початковий streamed shell не є успішною авторизацією | Реальний Chromium + Next SSR; окремо завершений 401 UI перевірено для invalid access |
| Server Action після expiry | Unauthorized у payload, 0 refresh, cookies не оновлені | Реальна форма у Chromium |
| Login зі stale cookies | Redirect /organizations, 500, 0 refresh | Реальний Chromium + middleware/SSR |
| Паралельний BFF refresh | 200/401/401, фінальні cookies видалено | Контрольований порядок upstream-відповідей |
| Refresh 503 | Клієнт отримує 401; cookies залишено | Реальний Next HTTP |
| Refresh остаточно відхилено | 401, обидві cookies очищено | Реальний Next HTTP |
| Правильно підписаний valid JWT | 200 | Реальний Nest JWT guard через HTTP, user port у пам’яті |
| Expired / malformed / wrong-signature JWT | 401 / 401 / 401 | Те саме |
| Видалений/невідомий користувач | 401 | Те саме з production DomainExceptionFilter |
| JWT без exp, підписаний правильним audit key | 200 | HS256 signature не обійдено; strategy не вимагає наявності exp. Поточний issuer зазвичай встановлює exp |
| Invalid cookie + valid Bearer | 401 | Cookie extractor має пріоритет; можливий сюрприз для прямих API-клієнтів |
| Tenant ADMIN requirement, OWNER | 200 | Реальний Nest guard, membership port у пам’яті |
| Tenant ADMIN requirement, MEMBER | 403 | Те саме |
| Чужа організація без membership | 404 | Те саме; не доводить всі repository IDOR paths |
| R1 → R2 → повтор R1 | Другий R1 відхилено | Реальні use cases + in-memory repository port |
| Дві одночасні ротації R1 | Одна fulfilled, одна rejected | Те саме; не PostgreSQL concurrency test |
| Logout | Refresh більше не працює; виданий access JWT ще дає 200 | Реальні use cases + HTTP JwtStrategy |
| Logout-all | Усі refresh записи користувача видалені | Реальний use case + in-memory port |

## WARNINGS — інші lifecycle-проблеми

- Refresh `find → delete → issue` не транзакційний. Якщо створення нового запису не вдалося після delete, попередня сесія втрачена. Втрата відповіді після успішної ротації залишає браузер зі старим refresh без способу отримати новий.
- Access tokens не прив’язані до активної DB session. Logout, logout-all та password reset не відкликають вже виданий access JWT; він живе до exp. Це потрібно явно визначити як вимогу, а не називати immediate logout.
- Backend access TTL default 2m, example env 15m; access cookie 15m. Cookie presence може пережити JWT expiry. Backend refresh cookie 30d, frontend 7d, DB default 7d. Це посилює stale-session UI, але не є основною причиною відсутнього SSR refresh.
- Logout action приховує backend/network failure і повідомляє успіх. Клієнтський logout очищає query cache тільки в поточній вкладці; міжвкладкова синхронізація не перевірена.
- `useCurrentUser` кешує identity 5 хвилин, retry=false; guest після замаскованого 503 може зберігатися до refetch/invalidation. Це не bypass backend authorization, але UI може показувати неправильний стан.
- Public Vocabulary layout ігнорує error з getCurrentUser та показує guest presentation. Backend outage і невалідна сесія можуть виглядати однаково до клієнтського відновлення.
- Login/sign-up/reset/verify/OAuth JSON/token handling і token persistence потребують security-виправлень із попереднього звіту. Наявні happy-path тести не доводять атомарність reset/verify чи SMTP/Auth0 поведінку.

## Повторна оцінка попереднього security-аудиту

Backend auth/invitation/user/storage та перевірені task use cases/repository залишилися без змін від `6e66522d`. Повторно прочитані небезпечні шляхи залишаються: автоматичний OAuth linking без verified email, OWNER invitation від ADMIN, profile email без verification, довільні attachment keys для видалення, foreign label binding, вимкнений throttler, plaintext refresh/reset/verification tokens, неатомарний reset, слабка startup validation, неповна redaction, відсутній 72-byte password bound. Auth actions досі повертають токени; BFF досі не перевіряє Origin і має неповну path validation; logout failure досі приховується.

Це збережені code-level findings, а не нові live attacks. Старі dependency advisory counts/build evidence не перенесено на поточний commit: встановлені версії вже відрізняються (поточний Next 15.5.25 проти попереднього 15.5.23).

### Що не підтверджую з аудиту іншої моделі

- **Два успішні refresh одного R1:** не доведено; Prisma `delete` за унікальним id відхиляє програвший запит до generateTokens. Реальний дефект — неатомарність і frontend cookie race. Це не P0 token duplication без додаткового доказу.
- **Повторна verification автоматично видає дві сесії:** не доведено; issuance відбувається після delete. Race reset відрізняється, бо password write стоїть перед delete.
- **whitelist + forbidNonWhitelisted:false означає mass assignment:** ні; невідомі поля видаляються. Потрібен конкретний шлях обходу, його не встановлено.
- **Відсутній sub означає vulnerability:** ні; userId може бути application claim. Важливі перевірена signature, required claim shape/expiry та контекст довіри.
- **Символ @ у path змінює фіксований upstream host:** сам по собі ні. Path normalization і redirect behavior треба перевіряти окремо від довільного SSRF.
- **Немає rate limiting → P0:** перебільшення без окремого критичного exploit chain. Це високий production risk.
- Перевірка OAuth `email_verified !== false` недостатня: пропущене значення також не є підтвердженням. Навіть `=== true` не замінює безпечну політику account linking.

## Виконані automated checks на поточному commit

- `pnpm --filter frontend exec vitest run 'src/app/api/proxy/[...path]/route.test.ts' src/shared/api/http-core.test.ts src/features/auth/api/actions/auth-actions.test.ts src/entities/user/model/guards/authentication-guards.server.test.ts src/features/auth/model/mutations/use-logout-hook.test.ts` → **5 files, 40 tests PASS**.
- `pnpm --filter backend exec jest --runInBand auth/tests organization/tests invitation/tests` → **35 suites, 187 tests PASS**.
- Runtime harnesses: `/tmp/auth-flow-upstream.cjs`, `/tmp/auth-flow-browser.cjs`, `/tmp/auth-flow-ui.cjs`, `/tmp/auth-backend-check.cjs`.
- Повні build/lint/coverage повторно не запускались: production source не змінювався; попередні результати стосувалися старого commit. Реальний поточний Next dev server успішно скомпілював перевірені routes.

## Що ще потрібно для повної production-перевірки

Окремий ізольований PostgreSQL integration environment для конкурентного refresh/reset/verify/logout, реальні Auth0 callback/state/provider policies і SMTP доставлення, багатовкладковий і багатопроцесний refresh, reload після простою, production cookie/proxy topology. Без цього не можна стверджувати, що вся auth-система перевірена end-to-end. Цей аудит вже відтворює конкретний користувацький баг на реальному frontend та встановлює його причини.

## SUGGESTIONS — порядок майбутньої роботи (не реалізовано)

1. Узгодити єдиний session recovery contract для SSR, BFF та actions: authenticated / unauthenticated / temporarily unavailable.
2. Відновити SSR/actions без втрати cookies і запобігти login redirect-пастці.
3. Зробити backend rotation атомарною та узгодити конкурентні відповіді/вкладки/інстанси; додати реальні PostgreSQL race tests.
4. Визначити session revocation після reset/logout і вимоги до повтору мутацій.
5. Закрити підтверджені authorization/OAuth/token-storage findings, потім провести повний browser + direct backend acceptance pass.

## Санітизовані runtime-докази

Нижче записані реальні результати контрольованого прогону. Перший SSR snapshot знято до завершення streamed UI; остаточний результат знаходиться в `SSR settled` і дорівнює 401 UI.

### auth-flow-results.json

```json
[
  {
    "name": "SSR invalid access + valid refresh",
    "status": 200,
    "url": "http://localhost:13000/vocab/settings",
    "text": "Vocabulary\nCatalog\nToggle theme\nSign in\nSettings\n\nManage your account settings.\n\nProfile\n\nThis is how others will see you on the site.",
    "cookies": [
      {
        "name": "refresh_token",
        "state": "original"
      },
      {
        "name": "access_token",
        "state": "original"
      }
    ],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      }
    ]
  },
  {
    "name": "SSR refresh-only session",
    "status": 200,
    "text": "Vocabulary\nCatalog\nToggle theme\nSign in\nSettings\n\nManage your account settings.\n\nProfile\n\nThis is how others will see you on the site.",
    "cookies": [
      {
        "name": "refresh_token",
        "state": "original"
      }
    ],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "absent"
      }
    ]
  },
  {
    "name": "sign-in with stale cookies",
    "status": 500,
    "url": "http://localhost:13000/organizations",
    "text": "500\nOops! Something went wrong :')\n\nWe apologize for the inconvenience.\nPlease try again later.\n\nTry Again\nBack to Home",
    "cookies": [
      {
        "name": "refresh_token",
        "state": "original"
      },
      {
        "name": "access_token",
        "state": "original"
      }
    ],
    "calls": [
      {
        "path": "/api/me/organizations/count",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/me/memberships",
        "method": "GET",
        "auth": "invalid"
      }
    ]
  },
  {
    "name": "BFF single invalid access",
    "status": 200,
    "cookies": [
      {
        "name": "access_token",
        "state": "rotated"
      },
      {
        "name": "refresh_token",
        "state": "rotated"
      }
    ],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      },
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "fresh"
      }
    ]
  },
  {
    "name": "BFF missing access",
    "status": 200,
    "cookies": [
      {
        "name": "access_token",
        "state": "rotated"
      },
      {
        "name": "refresh_token",
        "state": "rotated"
      }
    ],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "absent"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      },
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "fresh"
      }
    ]
  },
  {
    "name": "BFF parallel invalid access",
    "statuses": [
      200,
      401,
      401
    ],
    "cookies": [],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      },
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "fresh"
      },
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      }
    ]
  },
  {
    "name": "BFF refresh unavailable",
    "status": 401,
    "cookies": [
      {
        "name": "refresh_token",
        "state": "original"
      },
      {
        "name": "access_token",
        "state": "original"
      }
    ],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      }
    ]
  },
  {
    "name": "BFF revoked refresh",
    "status": 401,
    "cookies": [],
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      },
      {
        "path": "/api/auth/refresh",
        "method": "POST",
        "auth": "absent"
      }
    ]
  }
]
```

### auth-flow-ui-results.json

```json
[
  {
    "scenario": "SSR settled",
    "text": "401\nUnauthorized Access\n\nPlease log in with the appropriate credentials\nto access this resource.\n\nSign In",
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "invalid"
      }
    ]
  },
  {
    "scenario": "server action after expiry",
    "httpStatus": 200,
    "containsUnauthorized": true,
    "calls": [
      {
        "path": "/api/me",
        "method": "GET",
        "auth": "fresh"
      },
      {
        "path": "/api/me",
        "method": "PATCH",
        "auth": "invalid"
      }
    ],
    "cookies": [
      {
        "name": "refresh_token",
        "rotated": false
      },
      {
        "name": "access_token",
        "rotated": false
      }
    ]
  }
]
```

### auth-backend-results.json

```json
[
  {
    "name": "valid",
    "status": 200
  },
  {
    "name": "expired",
    "status": 401
  },
  {
    "name": "malformed",
    "status": 401
  },
  {
    "name": "wrong signature",
    "status": 401
  },
  {
    "name": "deleted user",
    "status": 401
  },
  {
    "name": "missing exp",
    "status": 200
  },
  {
    "name": "tenant guard own-owner",
    "status": 200
  },
  {
    "name": "tenant guard own-member",
    "status": 403
  },
  {
    "name": "tenant guard foreign",
    "status": 404
  },
  {
    "name": "invalid cookie overrides valid bearer",
    "status": 401
  },
  {
    "name": "sequential rotation replay",
    "replay": "rejected"
  },
  {
    "name": "parallel refresh (in-memory atomic delete port)",
    "statuses": [
      "fulfilled",
      "rejected"
    ]
  },
  {
    "name": "logout",
    "refresh": "rejected",
    "accessStatus": 200
  },
  {
    "name": "logout-all",
    "remainingSessions": 0
  }
]
```
