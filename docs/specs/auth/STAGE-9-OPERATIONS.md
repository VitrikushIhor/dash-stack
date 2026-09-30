# Етап 9: transport і production-конфігурація

Цей runbook описує конфігурацію та перевірки для коду етапу 9. Локальні перевірки не засвідчують зовнішні налаштування ingress, Auth0, S3 чи секретів у майбутньому середовищі; їх приймання належить етапу 10.

## Межі та розміщення

| Компонент | Вимога перед відкриттям доступу | Перевірка в середовищі |
| --- | --- | --- |
| Browser → Next | Лише HTTPS; `Host` відповідає публічному `FRONTEND_URL`/`NEXT_PUBLIC_APP_URL`; ingress відкидає або переписує клієнтські `X-Forwarded-*`; auth cookies `HttpOnly`, `Secure`, `SameSite=Lax`, host-only | Browser DevTools: cookie атрибути, redirects, security headers; sibling-origin form повертає 403 |
| Next → Nest | `API_URL` вказує на приватний HTTPS origin або локальний loopback; Nest не відкритий для анонімних browser clients поза контрольованим ingress | Запит до BFF з query-URL/encoded path не змінює upstream host; прямий Nest cookie mutation із sibling origin повертає 403 |
| Nest CORS/CSRF | `FRONTEND_URL` точно входить у `CORS_ORIGINS`; тільки довірені origins, без wildcard; не вмикати Express `trust proxy` за неперевіреними forwarded headers | Перевірити OPTIONS, `Origin:null`, missing Origin, same-site sibling, multipart і direct bearer окремо |
| OAuth | Якщо OAuth увімкнено, обидва сервіси мають той самий tenant; `AUTH0_DOMAIN` — hostname, `AUTH0_CLIENT_ID`/`AUTH0_CLIENT_SECRET` повний набір; callback у Auth0 точно `https://<frontend>/api/auth/oauth/callback`; code flow + PKCE S256 | Реальний login, cancel, два tabs, unverified email, provider outage; не додавати implicit grant |
| Files | Публічний image bucket і приватний attachment bucket різні; приватний bucket без public access і CDN policy | Прямий S3/CDN URL attachment недоступний гостю; download через auth BFF працює |
| Docs/logs | Swagger вимкнений у production; Pino виводить JSON, лише request ID, метод, шлях без query, статус; не записувати заголовки, body, email або токени | `GET /api/docs` і `/api/docs-json` → 404; capture успішного та відхиленого auth HTTP і Auth0/DB failures без секретів; ingress/Next access logs також не повинні містити OAuth `code` або query token |

У Nest `X-Request-Id` приймається тільки у форматі UUID v4; інакше створюється новий. BFF генерує UUID для proxy-запиту, передає його Nest і повертає в proxy response; refresh, який BFF викликав для цього запиту, отримує той самий ID. Ідентифікатор слугує лише для кореляції, не для авторизації. Pino request ID локально перевірений; end-to-end trace для інших Next server actions перевірити на етапі 10.

## Обмеження спроб та прибирання

Auth endpoints мають окремі per-account/per-credential ліміти, додатковий aggregate circuit breaker 1200 запитів за хвилину **на endpoint** і спільне PostgreSQL-сховище лічильників для кількох Nest процесів. `X-Forwarded-For` не є джерелом ідентичності для Nest. Для доступного з інтернету BFF ingress має застосовувати ліміт за справжнім клієнтом до передачі в Next; aggregate ліміт у Nest не замінює це правило й за масованої атаки може тимчасово вплинути на всіх користувачів endpoint. До перевірки trusted-ingress policy не вважати захист від розподіленого перебору завершеним у production.

Після застосування міграцій запускати `pnpm --filter backend auth:cleanup:expired` щохвилини. Один запуск обмежений 10 проходами: до 100 прострочених sessions/verification/legacy tokens і до 1000 прострочених throttle records за прохід. Для credentials cutoff становить 30 днів після expiry, для throttle rows — відразу після expiry. Ненульовий exit code означає backlog або помилку; сповістити оператора, перевірити БД й повторити запуск. Не запускати кілька неконтрольованих циклів і не робити неограниченого `DELETE`. У локальній БД команду й паралельні cleanup workers перевірено; production scheduler не створено.

## Секрети та ротація

`JWT_ACCESS_SECRET` підписує короткий access JWT; refresh credential є випадковим opaque значенням і в БД зберігається тільки його хеш. `JWT_REFRESH_SECRET` з попереднього механізму не використовується новим session protocol. У production доступ JWT живе не довше 15 хвилин, session credential — не довше 30 днів. Секрет повинен мати щонайменше 32 символи та походити з менеджера секретів; значення не друкувати в логах, CI чи командних прикладах.

Планова ротація JWT ключа для поточної реалізації з одним verification key:

1. Підготувати новий секрет у менеджері секретів і перевірити повний комплект production env без публікації значення.
2. Перевести всі Nest instances на новий секрет узгоджено. Не залишати стару й нову групи за одним балансувальником: старий instance відхилятиме JWT, виданий новим, і навпаки. Для blue/green маршрутизувати сесію до однорідної групи або зробити коротке координоване переключення.
3. Після переключення старі access JWT отримають 401; чинний opaque refresh credential залишається валідним, BFF видасть новий JWT. Перевірити browser reload, server action, proxy retry, дві вкладки й два Next процеси без примусового re-login.
4. Спостерігати за 401/refresh/503 та логами за request ID протягом щонайменше одного access TTL. Rollback секрету має таку саму потребу в однорідній групі; не змішувати ключі.
5. Якщо підозрюється компрометація session credentials, ротації JWT недостатньо: відкликати відповідні `AuthSession` і legacy refresh records; перевірити 401 на всіх пристроях. Якщо компрометований лише access signing key, ротація припиняє приймання старих JWT після coordinated switch.

Auth0 client secret і SMTP/S3 credentials ротуються у відповідних провайдерах зі staged update; перевірити OAuth callback і доставку листів до видалення старих credentials. Не змінювати `AUTH0_DOMAIN` без звірення frontend і backend env та allowlisted callback URL.
