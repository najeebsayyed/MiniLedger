# MiniLedger — AI Coding Agent Instructions

> Read `product.md` and `architecture.md` completely before editing code. Those documents are the source of truth. This file defines how to execute the work and what “done” means.

## 1. Mission

Build MiniLedger as a complete, tested, polished full-stack app that satisfies the internship assignment:

- React Native CLI app (not Expo), styled with NativeWind v4 + Tailwind CSS v3.
- Node.js + TypeScript API.
- PostgreSQL persistence.
- Phone number login with a mock six-digit OTP printed to the server log in local development.
- Create loans, list loans, highlight overdue entries, mark a loan repaid, and show server-calculated totals.
- GitHub-ready repository with setup README and a demo workflow.

Treat both product quality and functional correctness as first-class requirements. The UI must be visually distinctive and refined; do not ship a basic unstyled CRUD template. Equally, do not spend time on decorative animation while required endpoints or data correctness are broken.

## 2. Non-negotiable rules

1. **Inspect before changing.** First inspect the repository, installed versions, existing conventions, and current files. Preserve working code and the current package manager where reasonable. If this is a blank repository, follow `architecture.md`.
2. **Build a real app.** No static fake data for the normal app, no mocked API responses in production code, no frontend-only loan state, and no dead buttons.
3. **Assignment requirements beat optional ideas.** All P0 requirements must pass before receipt upload or any feature not in the assignment.
4. **Type safety.** TypeScript strict mode should be enabled. Avoid `any`, unchecked casts, and broad `// @ts-ignore`. If a boundary needs a type guard, write one.
5. **Validate at boundaries.** Validate environment values and every request payload/query param. Frontend validation improves UX but does not replace backend validation.
6. **Protect user data.** All loan access is scoped to the user ID from the verified token. Never trust an owner ID from the client. Never commit tokens, `.env`, real credentials, or uploaded user files.
7. **OTP constraints.** Generate a random OTP; never hardcode one; never return it in an API response; log it only in development/test mock mode as the assignment requires; never log it in production.
8. **Money correctness.** Use PostgreSQL decimal values and string serialization (`"1250.00"`). Do not sum money with ordinary JavaScript floating-point arithmetic on the backend.
9. **Date correctness.** Store due dates as `DATE` and apply a shared `Asia/Kolkata`-by-default business-date helper. An active loan is overdue only if `dueDate < businessDate`; due today is not overdue.
10. **Data-driven UI.** On create/repay, refresh/invalidate both loan and summary queries. Do not hardcode example totals.
11. **Polish the states, not only the happy path.** Provide loading skeletons, empty states, error/retry paths, input errors, success feedback, and a session-expired state.
12. **No unsupported claims.** Mock OTP is not real SMS authentication. Local receipt storage, if added, is not durable production object storage.
13. **Explainable implementation.** Prefer straightforward, readable solutions that the applicant can explain in an interview over clever abstractions, unnecessary packages, or needless layers.
14. **Do not stop at scaffolding.** Continue until the app flows end to end and checks have been run. Report any environment-dependent check that could not be run honestly.

## NativeWind implementation rules

- Use the **stable NativeWind v4 + Tailwind CSS v3** path for the React Native CLI app. Do not copy Expo configuration (`babel-preset-expo`, `expo/metro-config`, Expo app config, or Expo commands) into the native CLI project.
- Follow the official framework-less guide: https://www.nativewind.dev/docs/getting-started/installation/frameworkless. Check package compatibility with the installed React Native and Reanimated versions.
- Required files: `apps/mobile/tailwind.config.js`, `apps/mobile/global.css`, `apps/mobile/nativewind-env.d.ts`; configure the existing Babel and Metro files without erasing React Native/Reanimated or monorepo settings. Import `global.css` once.
- Include the mobile app's screen/component globs in Tailwind `content`; include shared workspace UI paths if any. Missing globs can cause styles to disappear from release builds.
- Use `className` on supported React Native components. Do not use DOM-only HTML elements or assume all third-party components support `className`; use supported interop or component props when required.
- Define semantic utility tokens matching `product.md` (background, surfaces, text, brand, brand accent, overdue/success, card/input radius, screen spacing). Avoid one-off arbitrary hex colors in screen components.
- Verify the NativeWind setup on Android: render a clearly visible test element, run Metro, build/install the app, and confirm production-used styles compile. Remove the temporary test element before submission.
- Preserve the app's existing package manager and lockfile. Do not use peer-dependency bypass flags to hide an incompatible dependency tree.

## 3. Execution plan — work in order

### Phase 0 — Repository assessment and plan

- Inspect files, scripts, available tooling, current app/API behavior, and environment constraints.
- Read `product.md` and `architecture.md`.
- Briefly summarize the implementation plan in your working notes.
- Do not ask the user to choose basic architecture decisions already defined in the specs.

**Exit gate:** Existing structure and implementation approach are understood; package manager and local database strategy are chosen consistently.

### Phase 1 — Foundation and developer experience

- Establish the workspace/root scripts and clean folder structure.
- Create/use the React Native Community CLI mobile project with committed native `android/` and `ios/` directories; do not add Expo, Expo Router, Expo Go, or Expo-managed config.
- Configure React Navigation, NativeWind v4 + Tailwind CSS v3 for bare React Native CLI, native module autolinking, `react-native-config`, and development-only local-HTTP network settings.
- Configure strict TypeScript, formatting/linting, environment validation, `.gitignore`, and `.env.example` files.
- Add PostgreSQL Docker Compose configuration and a documented migration workflow.
- Set up shared Zod contracts/types.
- Ensure root commands are coherent and actually work.

**Exit gate:** Fresh clone can install dependencies; API has a health endpoint; PostgreSQL can start; migrations can be applied.

### Phase 2 — Backend and tests first

Implement in this order:

1. Database schema and migrations for users, OTP challenges, and loans.
2. Mock OTP request/verify flow, expiry, attempt limit, single-use challenge, throttling, JWT, and auth middleware.
3. Create/list loan endpoints with validation, owner scoping, search/filter/sort/pagination as described.
4. Mark-as-repaid endpoint with atomic status transition.
5. Summary aggregation with correct decimal-safe totals and timezone date boundary.
6. Consistent errors, request IDs, safe logging, CORS, Helmet, and request body limit.
7. Automated tests for authentication, authorization, loans, and summary calculations.

Do not start polishing the mobile dashboard while the API schema and business rules are still changing. Write tests alongside the backend modules rather than at the end.

**Exit gate:** Backend tests pass; curl/API test flow can request OTP, verify OTP, create/list a loan, repay it, and read correct summary numbers. A user cannot reach another user's loan.

### Phase 3 — Mobile foundation and API integration

- Set up the React Native Community CLI project with native `android/` and `ios/` directories, React Navigation, and a session-aware root navigator.
- Configure NativeWind (`tailwind.config.js`, `global.css`, Babel, Metro `withNativeWind`, and `nativewind-env.d.ts`), semantic design tokens, native font assets, safe area, provider tree, query client, API client, and `react-native-keychain` for token storage.
- Implement phone entry and six-digit OTP verification first; verify they use the actual backend.
- Implement typed API feature modules and shared error handling.
- Build Home, Ledger, Add Loan, Loan Details, and Settings/Logout screens.
- Use TanStack Query for server data and invalidate the correct query keys after mutations.
- Verify a physical Android device can reach the API via the computer's LAN IP if a phone test is available.

**Exit gate:** A user can log in, add a record, see it from the server, mark it repaid, see summary values update, close/reopen the app and retain the session, then log out.

### Phase 4 — Visual design and interaction polish

Apply the complete direction in `product.md`, not generic default components.

- Configure and verify NativeWind before building screens. Create semantic Tailwind tokens and reusable UI primitives first; do not fall back to ad hoc `StyleSheet` styling for whole screens.
- Build the home summary hero using deep forest + warm ivory + restrained citrus accent.
- Make Total lent, Total repaid, Overdue amount, and Outstanding easy to understand without tapping.
- Make overdue rows visually distinct with an explicit label plus color/icon.
- Add responsive spacing, strong hierarchy, polished forms, designed empty/error/loading states, keyboard handling, haptics, and carefully chosen Reanimated transitions.
- Use native UI patterns where they help. Keep the core flow fast and understandable.
- Check smaller screens and larger font sizes.
- Ensure every interaction is connected to working behavior. A visual filter chip must filter. A “View all” must navigate. A retry button must retry.

**Exit gate:** No screen looks like a wireframe; no visible dead control; no clipped content; animation does not block use or hide financial values.

### Phase 5 — QA, hardening, and docs

- Run formatter/linter, TypeScript typecheck, backend tests, and mobile/build validation available in the environment.
- Fix the root cause of failures; do not hide errors by disabling strict rules or deleting useful tests.
- Test boundary cases: empty data, bad OTP, expired OTP, a loan due yesterday/today/tomorrow, already-repaid loan, API offline, token expiry, and two different users.
- Add README setup instructions, API endpoint summary, environment setup, database migrations, mock OTP instructions, physical-device networking tip, test commands, limitations, and demo script.
- Ensure screenshots/demo steps use real working data created during the demo.

**Exit gate:** From a fresh clone, a reviewer can follow the README and get to a working login screen without guessing hidden steps.

### Phase 6 — Optional bonus only if all previous gates pass

Implement receipt photo upload only after required functionality, tests, visual polish, and documentation are complete. If it threatens the required flow or repository stability, skip it and spend the time fixing core quality instead. If implemented, use authenticated routes, size/type validation, owner checks, a storage abstraction, and documentation about local-storage limitations.

## 4. UI implementation standards

### Visual quality bar

- Follow `product.md`'s Calm Confidence design system.
- Use NativeWind `className` utilities with centralized Tailwind tokens for color, spacing, radius, and typography; use `StyleSheet` only for complex animated values or third-party native props that require it.
- Create custom, coherent UI primitives rather than mixing library default styles.
- Use whitespace and typography for sophistication; avoid excessive cards, gradients, blur, shadows, or decorative icons.
- Prioritize the summary hierarchy and readable loan cards.
- Use real amounts from the backend and correct empty-state copy.
- Keep tap targets at least approximately 44×44 points and label icon-only controls for accessibility.
- Do not render stock images or generate a decorative hero image when a simple native/SVG motif is more consistent, lightweight, and crisp.

### Motion quality bar

- Use Reanimated for motion that meaningfully enhances the experience.
- Prefer 180–320 ms transitions, subtle press feedback, and short staggered entrances.
- No long intros, fake delays, perpetual attention-grabbing loops, or confetti for routine tasks.
- Respect reduced-motion settings as much as possible.
- App must function completely if animations are disabled.

### Screen-by-screen visual gate

- **Login:** clear phone input, country code, validation, loading, disabled/loading CTA.
- **OTP:** six-digit UX, focus/paste, error state, resend cooldown, edit-phone route, no OTP value exposed in UI.
- **Home:** dashboard summary card at the top; all three mandated totals visible; outstanding amount prominent; overdue attention area; recent entries; obvious Add action.
- **Ledger:** functioning filters and search, deterministic statuses/order, pull-to-refresh, designed empty/no-results/error states.
- **Add Loan:** clear required fields, positive-amount validation, due date picker, past dates allowed, keyboard-safe layout, submit state, retained values on failure.
- **Loan Details:** loan data from API, overdue/repaid label, correct conditional actions, confirmation before repayment.
- **Settings:** correct phone display, honest “demo/mock OTP” note, working logout.

## 5. API/backend implementation standards

- Keep Express `app.ts` separate from `server.ts` so tests can import the app without opening a port.
- Validate env on startup. Fail early with actionable messages if required configuration is missing.
- Keep route/controller/service/repository boundaries small and readable.
- Centralize error serialization and attach request IDs.
- Use shared schemas for HTTP contracts where practical; avoid duplicate schemas drifting between packages.
- Add pagination caps and bound search strings. Normalize phone numbers once, near the boundary.
- Use database transactions/conditional updates for single-use OTP consumption and loan repayment.
- Do not use a global test database that can be wiped accidentally. Tests must use an isolated test database/schema.
- Do not add unnecessary Redis, queues, microservices, Kubernetes, analytics, or cloud storage for an assignment that does not require them.

## 6. Completion checklist — do not claim “done” until verified

### Required feature checklist

- [ ] Mock OTP request prints code in local server log only.
- [ ] OTP validation, expiry, attempts, one-use behavior, and rate limiting are implemented.
- [ ] JWT-protected APIs reject invalid sessions.
- [ ] PostgreSQL schema/migrations work from scratch.
- [ ] Add loan endpoint and form work end-to-end.
- [ ] Loan list is persisted and is user-scoped.
- [ ] Overdue calculations use business date and are tested at boundaries.
- [ ] Mark as repaid works and cannot be double-counted.
- [ ] Summary endpoint calculates all required totals from PostgreSQL.
- [ ] Mobile summary and list refresh after add/repay.
- [ ] Search and status filters work.
- [ ] UI covers loading, empty, failure, retry, validation, and success.
- [ ] Logout removes stored token and private cached data.

### Engineering checklist

- [ ] No secret committed; `.env.example` has placeholders.
- [ ] No `any` used to dodge significant type errors.
- [ ] No unhandled promises or noisy console logs in normal production code.
- [ ] API responses do not expose OTP, stack traces, secrets, or other users' records.
- [ ] All core routes validate inputs and enforce owner scoping.
- [ ] Currency/date helpers have tests.
- [ ] NativeWind class utilities render correctly on Android; content globs cover all screens/components and style output is verified in the available build mode.
- [ ] Root lint, typecheck, and test commands match actual scripts.
- [ ] README setup was checked against the actual commands/files.

### Submission checklist

- [ ] GitHub-ready root README is complete.
- [ ] All three specification files are included: `product.md`, `architecture.md`, `agents.md`.
- [ ] Repository contains source, migration files, lockfile, and `.env.example`, but no `.env`, secrets, build outputs, or personal uploads.
- [ ] A 2–3 minute screen recording can demonstrate the complete required flow.

## 7. Recommended README/demo outline

README should include:

1. One-paragraph summary and screenshots (only real screenshots from the app).
2. Features and chosen stack.
3. Prerequisites.
4. Clone/install instructions.
5. Start PostgreSQL and apply migrations.
6. Configure API environment.
7. Start API and explain exactly where the mock OTP appears in the server log.
8. Configure mobile API URL; include physical Android LAN-IP guidance.
9. Start Metro and run the native Android app using the React Native CLI on an emulator/connected device; run iOS only on macOS with Xcode.
10. Test, lint, and typecheck commands.
11. API endpoint list.
12. Mock OTP and local-development limitations.

Suggested 2–3 minute video sequence:

- 0:00–0:20 — show app branding and phone login; request OTP and briefly show the server log.
- 0:20–0:40 — verify code and arrive at the dashboard summary.
- 0:40–1:10 — add a loan with a past due date; show form validation briefly if time permits.
- 1:10–1:35 — show the new overdue item clearly highlighted and demonstrate filters/search.
- 1:35–2:00 — open the loan, mark it repaid, and show the row status change.
- 2:00–2:25 — show summary totals update and navigate to settings/logout.
- 2:25–2:45 — optionally mention PostgreSQL, tests, and README setup.

Use a clean demo dataset and avoid revealing real personal phone numbers. Do not spend the recording on installation logs or long loading screens.

## 8. Final response expected from the coding agent

When implementation is complete, report only verifiable outcomes:

- Main features implemented.
- Stack and repository structure.
- Exact commands used to run API/mobile and migrations.
- Tests/lint/typecheck/build results (including any that could not be run and why).
- Environment values the user must provide, without requesting secrets in chat.
- Any known limitations or skipped bonus features.
- The best short demo sequence.

Never claim tests passed unless they actually ran and passed. Never claim the app is production-ready for real authentication while it uses mock OTP; describe it as a production-minded assignment build with a demo authentication adapter.
