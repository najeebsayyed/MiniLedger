# MiniLedger — Technical Architecture & Implementation Contract

> **Audience:** AI coding agent. This document defines the recommended stack, API behavior, data model, repository structure, and quality boundaries. The assignment-mandated technologies are non-negotiable: Node.js + TypeScript + PostgreSQL for the backend, React Native for the app, and phone + mock OTP login.

## 1. Architecture at a glance

Use a small TypeScript monorepo with three parts:

- `apps/mobile`: bare React Native app created and run with the React Native Community CLI; use React Navigation.
- `apps/api`: Node.js + TypeScript REST API using Express.
- `packages/contracts`: Shared Zod request/response schemas and TypeScript types that keep API and mobile contracts aligned.
- PostgreSQL: persistent source of truth.

The mobile app talks to the API over HTTP. The API authenticates requests, validates input, applies ownership/business rules, and reads/writes PostgreSQL. The mobile app must never connect directly to PostgreSQL.

```text
React Native CLI app (native Android/iOS projects)
  ├─ React Navigation stacks/tabs
  ├─ TanStack Query (server state/cache)
  ├─ React Hook Form + Zod (forms)
  └─ react-native-keychain (session token)
            │ HTTPS in production / HTTP on local LAN
            ▼
Node.js + TypeScript / Express REST API
  ├─ request-id, security headers, CORS, rate limiting
  ├─ auth middleware (Bearer token)
  ├─ route → controller → service → repository
  ├─ shared Zod contracts
  └─ Drizzle ORM
            │
            ▼
       PostgreSQL
```

## 2. Chosen stack and purpose

### Mobile

- **React Native CLI:** bare native Android/iOS application with committed `android/` and `ios/` projects; do not use Expo or Expo Go.
- **TypeScript:** typed screen, component, and API contracts.
- **NativeWind v4 + Tailwind CSS v3:** required styling system for utility-first `className` styling on React Native components; use the stable NativeWind v4 line for this bare React Native CLI assignment. Do not follow Expo-only setup instructions or switch to NativeWind v5 / Tailwind CSS v4 preview instructions.
- **`react-native-config`:** read build-time mobile environment values such as `API_BASE_URL`; do not rely on Expo-style `EXPO_PUBLIC_*` variables or assume Node `process.env` exists in the app.
- **React Navigation (`@react-navigation/native`, native stack, bottom tabs):** navigation between authentication, dashboard, ledger, loan details, add-loan, and settings screens.
- **TanStack Query:** server-state caching, mutations, invalidation, loading/error states, and refresh.
- **Zustand:** only small local session/UI state if needed; do not duplicate the loan list or summary in Zustand when TanStack Query already owns it.
- **React Hook Form + Zod:** dependable form state and validation.
- **`react-native-keychain`:** persist the bearer token in the platform Keychain/Keystore; never store it in AsyncStorage or plain text.
- **React Native Reanimated:** smooth entrances/press feedback and sheet transitions.
- **`react-native-linear-gradient`** (or a lightweight native/SVG treatment): restrained premium summary-card background.
- **`react-native-haptic-feedback`:** optional subtle success feedback.
- **`@react-native-community/datetimepicker`:** native due-date selection; follow its React Native version compatibility and complete any required Android/iOS native setup.
- **lucide-react-native + react-native-svg:** consistent icons.
- **Plus Jakarta Sans bundled as native font assets:** store fonts under `assets/fonts/` and link/configure them for the bare native app (for example, using the supported `react-native-asset` workflow for the chosen React Native version).
- **`react-native-image-picker`:** only if optional receipt upload is implemented after all P0 items pass; configure native permissions and test on a device.

**NativeWind is the primary styling system and is required.** Use `className` utility classes on compatible React Native components, with a centralized Tailwind theme for the product tokens. Use `StyleSheet.create` only when needed for values NativeWind cannot express cleanly (for example, complex Reanimated animated styles or a third-party native component prop); do not mix ad hoc inline styles across screens. Do not mix several icon libraries, animation systems, or UI kits.

#### NativeWind v4 setup contract (bare React Native CLI)

Use the official framework-less React Native setup guide: https://www.nativewind.dev/docs/getting-started/installation/frameworkless. Verify exact package compatibility with the selected React Native version before installing. NativeWind v4.2.7 is the stable line at the time these specs were prepared and targets Tailwind CSS v3.

From `apps/mobile`, install NativeWind and its required peers using versions compatible with the app's React Native release:

```bash
npm install nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
npm install --save-dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
```

If the repository uses pnpm, use equivalent `pnpm` commands in the mobile workspace; do not switch package managers. Run `npx pod-install` on macOS for iOS native dependencies. Reanimated may require a compatible Worklets/Reanimated configuration depending on the chosen React Native version; preserve the generated Babel configuration and follow the matching Reanimated installation guide.

Required configuration files under `apps/mobile/`:

- `tailwind.config.js`: set `presets: [require('nativewind/preset')]`; include `App.tsx`, `src/**/*.{js,jsx,ts,tsx}`, and any workspace-shared UI component paths in `content`; extend the theme with MiniLedger's semantic colors, spacing/radius, and typography tokens.
- `global.css`: include `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`. Import it once from the mobile entry (usually `App.tsx`).
- `babel.config.js`: add `nativewind/babel` to the existing presets without deleting required React Native/Reanimated configuration. Do not copy an Expo `babel-preset-expo` config into a CLI app.
- `metro.config.js`: wrap the existing React Native Metro config with `withNativeWind` from `nativewind/metro` and pass `{ input: './global.css' }`; preserve necessary monorepo watch-folder/resolver settings. Do not import `expo/metro-config`.
- `nativewind-env.d.ts`: include `/// <reference types="nativewind/types" />` so TypeScript recognizes `className` on supported components.

Use the following as the baseline Tailwind token configuration, adapting paths only if the repository layout differs. These semantic names intentionally match `product.md` examples:

```js
// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F6F7F2',
        surface: '#FFFFFF',
        'surface-muted': '#EEF2E9',
        'text-primary': '#16231F',
        'text-secondary': '#68756E',
        brand: '#153E35',
        'brand-accent': '#D8F36A',
        overdue: '#C94E42',
        'overdue-surface': '#FBE9E6',
        success: '#247A57',
        border: '#E1E6DE',
      },
      spacing: { screen: '20px' },
      borderRadius: { card: '24px', input: '16px' },
      fontFamily: { sans: ['PlusJakartaSans'] },
    },
  },
  plugins: [],
};
```

The font family value must match the actual native font family after the font assets have been linked; if names differ by platform, follow the React Native asset/linking behavior and test on-device. Do not add arbitrary content globs outside the repository. Keep the semantic token names consistent with `product.md` and check contrast, particularly for overdue labels and small text.

`apps/mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`apps/mobile/nativewind-env.d.ts`:

```ts
/// <reference types="nativewind/types" />
```

The Metro config should keep the React Native CLI's default configuration and any monorepo settings, then wrap it with `withNativeWind` from `nativewind/metro` using `input: './global.css'`. The Babel config must keep the project's existing React Native preset plus `nativewind/babel`; preserve the required Reanimated/Worklets plugin setup for the specific selected versions. Import `./global.css` once from `App.tsx`. Do not paste Expo-only config snippets into the CLI app.

Use `className` (not web DOM `class`) for `View`, `Text`, `Pressable`, and other supported React Native components. Third-party components that do not support `className` must be handled according to NativeWind's documented interop or styled using their supported props; never assume every native component accepts utility classes. Verify actual utility classes visually on an Android build.

### API

- **Node.js active LTS + TypeScript:** runtime and language.
- **Express:** REST routes and middleware.
- **PostgreSQL:** durable relational storage.
- **Drizzle ORM + drizzle-kit:** typed database access and committed migrations.
- **Zod:** request/env validation; reuse shared schemas where appropriate.
- **jose** or an equivalent maintained JWT library: signed bearer access token. Use one library consistently.
- **Pino:** structured logs; never log authorization headers or secrets.
- **Helmet:** security headers.
- **cors:** explicit origin policy.
- **express-rate-limit:** request/OTP abuse controls. Add a database-backed or shared store later if deploying multiple API instances; the local assignment can use its in-memory limiter.
- **Vitest + Supertest:** service/API tests.
- **Docker Compose:** local PostgreSQL service so a reviewer can start the database predictably.

Use mutually compatible versions for the selected React Native version, React Navigation, Reanimated, native modules, and Node.js LTS; commit the lockfile and do not use deprecated package APIs. Use `npx react-native doctor` (or the matching CLI diagnostic for the installed version) to validate the native toolchain. If the project already exists, inspect and preserve its package manager and conventions rather than performing a broad rewrite.

## 3. Repository layout

Create this structure unless an existing repository has a sound equivalent. Do not put all logic in one giant screen or `server.ts` file.

```text
miniledger/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts                    # builds/configures Express app
│   │   │   ├── server.ts                 # validates env, starts listener, graceful shutdown
│   │   │   ├── config/
│   │   │   │   └── env.ts                # Zod-validated environment variables
│   │   │   ├── db/
│   │   │   │   ├── client.ts             # DB client and connection lifecycle
│   │   │   │   └── schema/
│   │   │   │       ├── users.ts
│   │   │   │       ├── otp-challenges.ts
│   │   │   │       ├── loans.ts
│   │   │   │       └── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── not-found.ts
│   │   │   │   └── request-id.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.repository.ts
│   │   │   │   │   └── auth.schemas.ts
│   │   │   │   ├── loans/
│   │   │   │   │   ├── loans.routes.ts
│   │   │   │   │   ├── loans.controller.ts
│   │   │   │   │   ├── loans.service.ts
│   │   │   │   │   ├── loans.repository.ts
│   │   │   │   │   └── loans.schemas.ts
│   │   │   │   └── summary/
│   │   │   │       ├── summary.routes.ts
│   │   │   │       ├── summary.controller.ts
│   │   │   │       ├── summary.service.ts
│   │   │   │       └── summary.repository.ts
│   │   │   ├── lib/
│   │   │   │   ├── dates.ts              # business date/time-zone helper
│   │   │   │   ├── money.ts              # decimal-safe amount helpers
│   │   │   │   └── tokens.ts              # access-token creation/verification
│   │   │   └── types/
│   │   │       └── express.d.ts           # authenticated user type augmentation
│   │   ├── drizzle/                       # generated, committed SQL migrations
│   │   ├── tests/
│   │   │   ├── auth.test.ts
│   │   │   ├── loans.test.ts
│   │   │   ├── summary.test.ts
│   │   │   └── helpers/
│   │   ├── drizzle.config.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/
│       ├── src/
│       │   ├── navigation/                # React Navigation configuration
│       │   │   ├── RootNavigator.tsx       # session-aware auth/app gate
│       │   │   ├── AuthNavigator.tsx       # phone login + OTP verification
│       │   │   ├── AppNavigator.tsx        # bottom tabs + detail stack
│       │   │   └── navigation-types.ts
│       │   ├── components/
│       │   │   ├── ui/                     # Button, Field, Screen, Toast, etc.
│       │   │   ├── feedback/               # skeleton, empty/error states
│       │   │   └── layout/                 # header, bottom action, safe area
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── api.ts
│       │   │   │   ├── hooks.ts
│       │   │   │   └── schemas.ts
│       │   │   ├── loans/
│       │   │   │   ├── api.ts
│       │   │   │   ├── hooks.ts
│       │   │   │   ├── components/
│       │   │   │   └── schemas.ts
│       │   │   └── summary/
│       │   │       ├── api.ts
│       │   │       └── hooks.ts
│       │   ├── lib/
│       │   │   ├── api-client.ts            # base URL, token, error parsing
│       │   │   ├── query-client.ts
│       │   │   └── secure-storage.ts
│       │   ├── providers/
│       │   │   └── app-providers.tsx
│       │   ├── store/
│       │   │   └── auth-store.ts            # only if needed for session state
│       │   ├── theme/
│       │   │   ├── native-values.ts              # only values needed by animation/native component props
│       │   │   ├── class-names.ts                # optional helper for composing conditional classes
│       │   │   └── index.ts
│       │   ├── utils/
│       │   │   ├── currency.ts
│       │   │   └── dates.ts
│       │   └── tests/                       # formatters/hooks/component tests where practical
│       ├── assets/
│       │   ├── fonts/
│       │   └── images/
│       ├── android/                       # native Android project; commit source files
│       ├── ios/                           # native iOS project; commit source files
│       ├── index.js                       # React Native entry point
│       ├── App.tsx                        # root providers + RootNavigator
│       ├── babel.config.js                # NativeWind + React Native/Reanimated-compatible presets/plugins
│       ├── metro.config.js                 # Metro + withNativeWind / monorepo configuration
│       ├── tailwind.config.js              # NativeWind preset, content globs and semantic design tokens
│       ├── global.css                     # Tailwind directives consumed by NativeWind
│       ├── nativewind-env.d.ts             # NativeWind className TypeScript declarations
│       ├── react-native.config.js          # native assets configuration if needed
│       ├── .env.example
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── contracts/
│       ├── src/
│       │   ├── auth.ts
│       │   ├── loan.ts
│       │   ├── summary.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   └── demo-script.md                       # optional short recording checklist
├── docker-compose.yml                       # PostgreSQL only is enough
├── package.json                             # workspace commands
├── pnpm-workspace.yaml
├── .gitignore
├── README.md
├── product.md
├── architecture.md
└── agents.md
```

Keep controllers thin. Controllers parse transport concerns and call services; services enforce rules; repositories contain DB queries. Do not create needless interfaces/classes for every function. The structure should improve understanding rather than be architecture theatre.

## 4. Shared API conventions

### Base URL and JSON

- Local base URL: `http://localhost:4000/api/v1` from the development computer.
- For a physical phone on the same Wi-Fi, use the computer's reachable LAN IPv4 address, e.g. `http://192.168.1.20:4000/api/v1`; `localhost` on a phone refers to the phone itself.
- Production uses HTTPS.
- Request and response bodies are JSON except a future optional multipart receipt-upload endpoint.
- Every successful response uses `{ "data": ... }`. A paginated collection additionally has `meta`.
- Every error uses `{ "error": { "code": "...", "message": "Human-readable message", "requestId": "...", "details": ... } }`; omit details when not safe/useful.
- Set an `X-Request-Id` response header and include the same value in error payloads/logs.
- Never return stack traces, SQL text, OTP, token secret, or internal environment values to clients.

### Authentication

Except for the two auth routes and health endpoint, routes require:

`Authorization: Bearer <accessToken>`

A valid token identifies one user. Always derive `ownerId` from the verified token, never trust an `ownerId` sent by the app.

## 5. API specification

The following endpoints are required. Path names and response fields should remain consistent across the API, mobile client, tests, and README.

### `GET /healthz`

Purpose: readiness/liveness check for local development and hosting. Do not expose environment secrets or detailed database connection strings. Response:

```json
{ "data": { "status": "ok" } }
```

### `POST /api/v1/auth/request-otp`

Request:

```json
{ "phoneNumber": "+919876543210" }
```

Behavior:

- Validate and normalize the phone number to E.164 format.
- Generate a cryptographically random 6-digit code, including leading zeros.
- Store only a keyed hash or cryptographic hash of the OTP, with expiry and attempt tracking. Do not store a plaintext OTP in PostgreSQL.
- OTP expires after 5 minutes, is single-use, and allows no more than 5 verification attempts.
- Enforce request throttling (e.g. one request per phone per 60 seconds and an IP/API rate limit).
- In `OTP_MODE=mock` and `NODE_ENV=development`/`test`, print the generated OTP to the API server log so the human can complete the assignment flow. Mask the phone number in the log but show the OTP, because the assignment explicitly requests it. Ensure the log path is impossible in production.
- Do not include the OTP in the API response or mobile UI.
- Do not reveal whether a phone number is already registered. Creating a user after successful verification is acceptable.

Success response (example):

```json
{
  "data": {
    "message": "A demo verification code was generated. Check the development server log.",
    "expiresInSeconds": 300,
    "resendAfterSeconds": 60
  }
}
```

Expected error codes include `VALIDATION_ERROR`, `RATE_LIMITED`, and `MOCK_OTP_DISABLED`. Do not return the code in an error response either.

### `POST /api/v1/auth/verify-otp`

Request:

```json
{ "phoneNumber": "+919876543210", "otp": "042731" }
```

Behavior:

- Find the latest valid challenge for that normalized phone number.
- Reject if missing, expired, consumed, too many attempts, or incorrect.
- Increment attempts on incorrect submissions and consume the challenge atomically on success.
- Upsert/find a user by normalized phone number only after successful OTP verification.
- Issue a signed bearer access token with a documented expiry (e.g. 7 days for the demo). Token secret must come from a validated environment variable, never source code.

Success response:

```json
{
  "data": {
    "accessToken": "<signed-token>",
    "tokenType": "Bearer",
    "expiresInSeconds": 604800,
    "user": { "id": "uuid", "phoneNumber": "+919876543210" }
  }
}
```

### `GET /api/v1/me`

Authenticated. Returns the current user's basic profile so the app can restore/validate the session:

```json
{ "data": { "id": "uuid", "phoneNumber": "+919876543210", "createdAt": "2026-10-21T10:00:00.000Z" } }
```

### `GET /api/v1/loans`

Authenticated. Supports optional query parameters:

- `status=all|outstanding|overdue|repaid` (default `all`).
- `search=<friend-name-substring>` (trim input; case-insensitive match).
- `page=1` (default 1) and `pageSize=20` (default 20, max 50) for predictable pagination.
- `sort=smart|dueDateAsc|newest` (default `smart`).

`smart` ordering: overdue active first, active due today next, other active loans by due date ascending, then repaid loans by updated/created date descending. Always use a deterministic tie-breaker such as `createdAt DESC, id ASC`.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "friendName": "Aarav",
      "amount": "2500.00",
      "currency": "INR",
      "dueDate": "2026-10-18",
      "status": "ACTIVE",
      "isOverdue": true,
      "repaidAt": null,
      "receiptUrl": null,
      "createdAt": "2026-10-10T10:00:00.000Z",
      "updatedAt": "2026-10-10T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
}
```

Notes:

- `isOverdue` is derived at response time, not stored as a permanent boolean.
- `amount` is serialized as a decimal string with two fraction digits.
- A `REPAID` loan must have `isOverdue: false` even if its due date is in the past.
- Pagination is optional for the smallest implementation but recommended and must be consistent if present. The mobile app must still refresh the summary independently.

### `POST /api/v1/loans`

Authenticated. Request:

```json
{ "friendName": "Aarav", "amount": "2500.00", "dueDate": "2026-10-28" }
```

Validation:

- Friend name trimmed and 1–80 characters.
- Amount is a decimal string representing a value greater than `0`, at most two fraction digits, within `NUMERIC(12,2)` range. Reject `NaN`, infinity, negative values, zero, and malformed strings.
- Due date must be a valid real calendar date in `YYYY-MM-DD`, not a timestamp. Past dates are valid.
- Ignore/reject client-supplied `ownerId`, `status`, `repaidAt`, `isOverdue`, or summary fields. Server controls those fields.

Creation initializes `status=ACTIVE`, `repaidAt=null`, and timestamps. Response is `{ "data": <loan DTO> }` with HTTP `201`.

### `PATCH /api/v1/loans/:id/repay`

Authenticated. Marks a loan as fully repaid; no partial repayments. This route only updates a loan when both the id and authenticated owner match and current status is `ACTIVE`.

Success: `{ "data": <updated loan DTO> }`.

Behavior and errors:

- `404 LOAN_NOT_FOUND` for a missing loan or a loan belonging to another user. Do not confirm another user's record exists.
- `409 LOAN_ALREADY_REPAID` for an already repaid loan, or return the current representation only if that is consistently documented; prefer 409 for explicitness.
- Set `status=REPAID` and `repaidAt=now` in one conditional update/transaction to prevent double repayment under concurrent requests.
- Update `updatedAt` and return computed `isOverdue=false`.

### `GET /api/v1/summary`

Authenticated. This is a server aggregation, not a sum of the current screen's rows.

Example response:

```json
{
  "data": {
    "currency": "INR",
    "totalLent": "10000.00",
    "totalRepaid": "4000.00",
    "outstandingAmount": "6000.00",
    "overdueAmount": "2000.00",
    "activeLoansCount": 3,
    "repaidLoansCount": 2,
    "overdueLoansCount": 1
  }
}
```

Calculation rules for the authenticated owner:

- `totalLent = SUM(amount)` across every loan.
- `totalRepaid = SUM(amount WHERE status = REPAID)`.
- `outstandingAmount = SUM(amount WHERE status = ACTIVE)` (also equals `totalLent - totalRepaid` under the full-repayment model).
- `overdueAmount = SUM(amount WHERE status = ACTIVE AND dueDate < businessDate)`.
- Counts follow the same filters; no other user's rows can affect results.
- Use PostgreSQL decimal/numeric aggregation. Serialize as strings with two decimals.
- The business date uses `APP_TIMEZONE`, default `Asia/Kolkata`, and `YYYY-MM-DD` comparison against PostgreSQL `DATE` values. Today is not overdue; it becomes overdue the next day.
- Empty ledger yields zero decimal strings and zero counts, not `null`.

## 6. Data model

Use UUID primary keys, foreign-key constraints, useful indexes, and migration files committed to Git.

### `users`

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key, generated server/database-side |
| `phone_number` | VARCHAR/TEXT | Required, unique, normalized E.164 |
| `created_at` | TIMESTAMPTZ | Required, default now |
| `updated_at` | TIMESTAMPTZ | Required, updated on mutation |

### `otp_challenges`

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `phone_number` | VARCHAR/TEXT | Required, normalized |
| `code_hash` | TEXT | Required, never plaintext |
| `expires_at` | TIMESTAMPTZ | Required |
| `attempt_count` | INTEGER | Default 0, maximum 5 |
| `consumed_at` | TIMESTAMPTZ nullable | Set exactly once on successful verify |
| `created_at` | TIMESTAMPTZ | Required |

Add an index for `(phone_number, created_at DESC)` and an expiry/cleanup strategy. A scheduled cleanup is not needed for the assignment; expired rows may be cleaned opportunistically or by a documented SQL command. Handle newest valid challenge deterministically.

### `loans`

| Column | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `owner_id` | UUID | Required FK to `users.id`; indexed |
| `friend_name` | VARCHAR(80) | Required, trimmed |
| `amount` | NUMERIC(12,2) | Required and greater than 0 |
| `due_date` | DATE | Required; date-only, no time zone |
| `status` | ENUM or constrained text | `ACTIVE` or `REPAID`, default `ACTIVE` |
| `repaid_at` | TIMESTAMPTZ nullable | Null while active; set at repayment |
| `receipt_url` | TEXT nullable | Optional P2 only; null in core MVP |
| `created_at` | TIMESTAMPTZ | Required, default now |
| `updated_at` | TIMESTAMPTZ | Required, updated on mutation |

Add indexes supporting user-scoped queries, such as `(owner_id, status, due_date)`, `(owner_id, created_at DESC)`, and an appropriate index for friend name search if needed. Define `ON DELETE CASCADE` from users to loans and OTP challenges only if that deletion policy is deliberately implemented. Do not add a `partial_amount_repaid` field in this version.

## 7. Business logic, dates, and money safety

- Store loan amount in PostgreSQL `NUMERIC(12,2)`; use Drizzle/PostgreSQL decimal handling, not binary floating-point sums.
- Accept/return API amounts as decimal strings such as `"999.50"`. Convert only for display using an INR formatter. Avoid arithmetic like `Number(a) + Number(b)` for authoritative backend totals.
- Validate date strings strictly and use PostgreSQL `DATE`.
- Implement one shared `getBusinessDate()` helper based on `APP_TIMEZONE`; do not repeat subtly different date comparisons in routes and screens.
- Overdue is derived: `status === ACTIVE && dueDate < businessDate`.
- Mark-repaid update must be conditional and atomic; summary updates on the next query.
- Every database query for loans must include `owner_id = authenticatedUser.id`; never rely on a client-provided filter for ownership.

## 8. Authentication and security boundaries

This is an internship assignment with mock OTP, not production SMS authentication. It should still demonstrate secure engineering habits.

- OTP mode must be explicit (for example, `OTP_MODE=mock`). The mock logger must be disabled in production; application startup should fail or OTP requests should return `503 MOCK_OTP_DISABLED` if a production deployment is configured with mock mode and no real provider.
- Use crypto-secure OTP generation; avoid predictable codes, hardcoded `123456`, or Math.random.
- Persist an OTP hash only. Expire within five minutes, limit attempts to five, consume once, and rate-limit requests/verifications.
- Store signing secret in `JWT_SECRET`; fail startup if missing/too short. Never commit secrets.
- JWT should include a stable user id (`sub`), issuer/audience where practical, and expiry. Verify signature and expiry on every protected request.
- `react-native-keychain` token storage on mobile. Remove token and private TanStack Query cache on logout or expired/invalid session.
- Use Helmet, explicit CORS allowlist, JSON body-size limit, request validation, and generic server errors.
- Always enforce resource ownership on details, update, and optional upload routes.
- Do not log OTP outside dev/test, bearer tokens, passwords, authorization headers, or full request bodies. Redact phone numbers except where the assignment explicitly needs local OTP pairing; even then mask the phone.
- Use parameterized ORM queries; do not construct SQL using untrusted string concatenation.
- Keep receipt uploads, if implemented, restricted by file MIME/size and user ownership.

## 9. Error and validation contract

Use a small, consistent error set:

- `VALIDATION_ERROR` — request or query validation failed (`400`). Include safe field-level errors if useful.
- `UNAUTHENTICATED` — token missing/invalid/expired (`401`).
- `FORBIDDEN` — authenticated but action is generally disallowed (`403`); prefer `404` for another user's loan to avoid disclosure.
- `LOAN_NOT_FOUND` — missing/not-owned loan (`404`).
- `LOAN_ALREADY_REPAID` — already transitioned (`409`).
- `RATE_LIMITED` — throttled request (`429`) with retry hint if available.
- `MOCK_OTP_DISABLED` — demo mock auth unavailable outside allowed environments (`503`).
- `INTERNAL_ERROR` — unexpected server failure (`500`) with generic public message and request id.

Validate environment variables at startup with Zod. Required environment values include `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `APP_TIMEZONE`, and `OTP_MODE`. `CORS_ORIGINS` is optional and is used only if a browser-based client is added; a native React Native app does not rely on browser CORS. Provide safe `.env.example` files containing placeholders only.

## 10. Mobile data flow

- Put API calls in feature modules, not inline inside JSX.
- Configure a single typed API client with base URL, JSON handling, bearer-token injection, timeout/abort behavior, and consistent parsed errors.
- The access token is read from `react-native-keychain` and attached to authenticated calls.
- Use TanStack Query keys consistently, for example `['summary']`, `['loans', filters]`, `['loan', id]`, and `['me']`.
- On add/repay success, invalidate `['summary']`, relevant `['loans', ...]`, and `['loan', id]` if applicable. Server responses remain the source of truth. Optimistic updates are optional; do not risk inconsistent totals just to animate faster.
- On `401`, clear session and private caches once, then redirect to login without creating an infinite redirect loop.
- The API base URL is environment-configurable. Explain in README that a physical phone cannot reach the development computer through `localhost`; use the computer's LAN IPv4 address on the same network.
- Use `KeyboardAvoidingView` and safe-area-aware layouts on forms.

## 11. Test plan

At minimum, create repeatable tests for:

### Backend auth

- Valid phone can request a mock OTP; response excludes the OTP and the injected logger receives it only in test/dev configuration.
- Correct OTP succeeds and returns a token.
- Wrong OTP increments attempts and is rejected.
- Expired, consumed, and attempt-limit-exceeded OTPs are rejected.
- Rate limiting is applied to OTP endpoints.
- Protected route rejects missing/invalid token.

### Backend loans and summary

- Creating a loan validates name, amount, and date.
- A user can list only their own loans.
- User A cannot repay or inspect User B's loan by ID.
- Repay changes status and sets `repaidAt`; second repay is handled consistently with 409.
- Due-date boundary: yesterday active is overdue; today active is not; repaid yesterday-due is not overdue.
- Summary math is correct for empty, active, repaid, and overdue combinations.
- Tests should run against a dedicated test database (or appropriately isolated schema/container), not destructive operations on a developer's database.

### Mobile

- At least test pure money/date formatting and form validation. Add a small component test for important status labels if the setup allows it.
- Manual QA must test login, create, filter/search, detail/repay, summary refresh, app relaunch, and logout.

## 12. Environment, scripts, and local setup

Use `pnpm` workspaces unless the existing repository clearly uses another package manager. Provide root commands such as:

- `pnpm install` — install all workspace dependencies.
- `pnpm db:up` — start PostgreSQL using Docker Compose.
- `pnpm db:migrate` — apply committed migrations to the development database.
- `pnpm dev:api` — run API in watch mode.
- `pnpm dev:mobile` — start Metro bundler for the bare React Native app.
- `pnpm dev:android` — build/install and launch the Android app on an emulator or connected device.
- `pnpm dev:ios` — build/install and launch the iOS app (macOS with Xcode required).
- `pnpm test` — run API tests and any configured shared/mobile tests.
- `pnpm lint` — run lint checks.
- `pnpm typecheck` — check all TypeScript packages.

Exact commands must match the generated package scripts. Document prerequisites: Node.js active LTS, pnpm/Corepack, Docker Desktop or local PostgreSQL, Android Studio + Android SDK/JDK for Android, and macOS + Xcode for iOS. A physical device must have USB debugging/developer mode configured as appropriate. Add a root `docker-compose.yml` for PostgreSQL only; do not containerize the mobile app.

Sample API `.env.example` (placeholders only):

```dotenv
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://miniledger:miniledger_dev@localhost:5432/miniledger
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
JWT_ISSUER=miniledger-api
JWT_AUDIENCE=miniledger-mobile
APP_TIMEZONE=Asia/Kolkata
OTP_MODE=mock
CORS_ORIGINS=
```

Sample mobile `.env.example`:

```dotenv
API_BASE_URL=http://192.168.1.20:4000/api/v1
```

Read `API_BASE_URL` from `react-native-config` (for example, `Config.API_BASE_URL`) and rebuild the native app after changing it. Use the actual computer LAN address when testing on a physical device; do not leave a made-up address presented as a universal value. For Android Emulator, the development host is commonly reachable at `10.0.2.2`; for iOS Simulator, `localhost` usually reaches the host Mac. Verify for the selected emulator/device. React Native native apps do not use browser CORS in the same way as web apps, so do not require Metro’s port as a CORS origin; keep CORS explicitly configured only for any HTTP web clients. If local development uses plain HTTP, configure Android cleartext traffic and iOS App Transport Security exceptions in debug/development configuration only; production must use HTTPS. Never enable broad cleartext/ATS exceptions in a release build.

## 13. Production-minded delivery checklist

- [ ] Migrations are committed and a fresh database can be initialized from README steps.
- [ ] `.env.example` files exist; real `.env` and secrets are ignored by Git.
- [ ] Lint/typecheck/test commands work from the root.
- [ ] API handles malformed JSON, validation failures, unauthorized calls, missing routes, and unexpected errors gracefully.
- [ ] `GET /healthz` works without leaking environment data.
- [ ] OTP is never returned to the app and mock logging is disabled outside dev/test.
- [ ] All loan endpoints filter by authenticated owner.
- [ ] Decimal summary math and overdue date boundaries have tests.
- [ ] Mobile sessions use `react-native-keychain`; private cache is cleared on logout.
- [ ] The UI works with empty, loading, error, and populated data.
- [ ] No placeholder actions, fake server responses, or unconnected controls remain.
- [ ] README includes setup, environment variables, how to read the mock OTP log, how to run tests, and a 2–3 minute demo outline.

## 14. Optional receipt endpoint (P2 only)

Only if all required acceptance checks already pass, implement:

`POST /api/v1/loans/:id/receipt` — authenticated multipart upload with field `receipt`, image-type and size limits, owner check, and response `{ "data": { "receiptUrl": "..." } }`.

Use a storage service abstraction so local disk storage is isolated and can later be replaced by object storage. Store only the path/URL in `loans.receipt_url`. Add `.gitignore` entry for local uploads. Do not use a base64 string in JSON or store image bytes in a text column. Document that local file storage is for demonstration and needs persistent private object storage for an actual production deployment.

## 15. Documentation references

Use current official documentation rather than copied outdated snippets. Select package versions compatible with the React Native version in `package.json`.

- React Native environment setup (Community CLI): https://reactnative.dev/docs/set-up-your-environment
- React Native CLI getting started: https://reactnative.dev/docs/getting-started-without-a-framework
- React Native Config: https://github.com/luggit/react-native-config
- React Native DateTimePicker: https://github.com/react-native-datetimepicker/datetimepicker
- React Native Image Picker: https://github.com/react-native-image-picker/react-native-image-picker
- React Navigation: https://reactnavigation.org/docs/getting-started/
- React Native Keychain: https://github.com/oblador/react-native-keychain
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
- NativeWind v4 framework-less React Native CLI setup: https://www.nativewind.dev/docs/getting-started/installation/frameworkless
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- PostgreSQL numeric types: https://www.postgresql.org/docs/current/datatype-numeric.html
- PostgreSQL date/time types: https://www.postgresql.org/docs/current/datatype-datetime.html
- Express security best practices: https://expressjs.com/en/advanced/best-practice-security.html
