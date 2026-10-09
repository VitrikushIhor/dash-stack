# ADR-0002: OAuth authorization code flow через Next callback

Статус: реалізовано в коді; live Auth0 acceptance ще не виконано.

## Контекст

Попередній frontend використовував `response_type=token` і передавав provider access token через URL fragment та Server Action. Callback не звіряв `state`, а backend приймав access token без прив’язки до ініційованого браузером входу. Це створювало ризик login CSRF і підміни сесії.

## Рішення

- Next `GET /api/auth/oauth/start` приймає лише allowlisted connection, створює 256-bit `state` і PKCE verifier, зберігає verifier у короткоживучій HttpOnly cookie з іменем, прив’язаним до state, і перенаправляє до Auth0 з `response_type=code`, S256 challenge та фіксованим callback URI.
- Next `GET /api/auth/oauth/callback` звіряє state з cookie, видаляє cookie при успіху, помилці або скасуванні, передає code та verifier у backend і встановлює локальні session cookies лише після успішного обміну. Окремі cookie дозволяють двом вкладкам одночасно почати OAuth.
- У production cookie використовує префікс `__Host-`, `Secure`, path `/` і не встановлює Domain. Це унеможливлює її підстановку з сусіднього піддомену.
- Nest `POST /auth/oauth/code` обмінює code на Auth0 token із server-side client secret, PKCE verifier і redirect URI з `FRONTEND_URL`; отримує `/userinfo`, перевіряє його структуру, verified email та точну provider identity. Старий `POST /auth/oauth/exchange` більше не видає сесію за довільним access token. Стара сторінка `/oauth/callback` перенаправляє на sign-in.
- Authorization code одноразовий на стороні Auth0. Повторний callback після очищення cookie відхиляється; конкурентний повторний обмін того самого code відхиляє Auth0.

## Налаштування та перевірка

`NEXT_PUBLIC_APP_URL` на frontend і `FRONTEND_URL` на backend повинні мати однаковий origin. У Auth0 application дозволити callback `https://<app-origin>/api/auth/oauth/callback`, authorization code grant і PKCE S256; потрібні `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` на backend і відповідні public domain/client ID на frontend. Після конфігурації перевірити Google/GitHub login, скасування, wrong/replayed state, дві вкладки й provider outage у реальному браузері. Локальні unit tests не доводять правильність Auth0 tenant settings.


## OAuth signup and identity synchronization (2026-09-28)

New OAuth identities create the user and provider account through one application transaction port. Account insertion failures roll back the user, allowing a later retry. Existing users with the same email are still rejected rather than automatically linked.

After a successful code exchange and cookie update, the callback redirects with a non-secret completion marker. The mounted auth session synchronizer consumes and removes it, clears local query data, and broadcasts a signed-in event to other tabs. StrictMode replay cannot publish the same marker twice. The marker is only a cache synchronization signal and grants no authentication rights.

Logout clears local query data and broadcasts signed-out even when the server action reports a revocation failure, because the action clears auth cookies in its finally path. Server revocation errors remain visible; local cookie removal does not imply successful remote session revocation.

The PostgreSQL OAuth, auth lifecycle/retention and task attachment regression suites use disposable schemas, including historical migrations. Global cleanup runs only inside their test schema.


## Explicit account linking (2026-09-28)

Authenticated users can connect Google or GitHub in Connected accounts, available in dashboard and vocabulary settings. Linking never merges users based on email. A verified provider identity can have a different email from the local user, because ownership of both identities is confirmed through the current local session and provider authorization.

Initiation is a same-origin POST. The existing OAuth callback URL and PKCE/state protocol are reused; a short-lived HttpOnly flow cookie stores a verifier, provider, allowlisted return path and SHA-256 binding to the initiating session credential. Provider confirmation requests `prompt=login`. The callback rejects a changed session, consumes the flow cookie and submits the code through the authenticated BFF. Successful linking preserves the current local identity and session.

The backend exchanges the code, requires a verified email and the expected provider, then atomically links the identity. Existing identities owned by another user are rejected. One account per supported provider is enforced by serializing changes on the user row; the provider identity unique constraint resolves cross-user races. Repeating the same successful link is idempotent. Unlinking and merging existing users are outside this feature.

No new callback URL or database migration is required. Existing Auth0 application credentials and allowed callback `/api/auth/oauth/callback` must be configured, with Google/GitHub connections enabled. Local tests use a stub provider authorization page; live provider confirmation remains a deployment acceptance check.

OAuth request origins use the request Host with its protocol and must exactly match the registered application origin. Forwarded host headers are not trusted. This handles Next's internal localhost URL without accepting arbitrary callback origins.
