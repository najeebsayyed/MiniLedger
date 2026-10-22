# MiniLedger — Product Requirements & Experience Specification

> **Audience:** AI coding agent building the assignment. Treat this document as the product source of truth.
> **Product promise:** Track money lent to friends clearly, without making money conversations awkward.
> **Tagline:** *Money moves. Friendships stay clear.*

## 1. Product overview

MiniLedger is a polished, mobile-first personal ledger for recording money lent to friends. A user signs in with a phone number and mock OTP, adds a loan with the friend's name, amount, and due date, sees which loans are overdue, and marks a loan as repaid. A dashboard summarizes total lent, total repaid, outstanding, and overdue amounts.

Build this as a real working full-stack application, not a clickable mockup. All displayed loan and summary data must come from the backend and PostgreSQL. Do not seed fake production-facing dashboard numbers or make buttons that do nothing.

### Target user

Someone who occasionally lends money to friends/family and wants a simple, private way to remember who owes what and when it is due.

### Core user journey

1. Open MiniLedger.
2. Enter a phone number.
3. Request an OTP; the local backend prints the OTP in its server log.
4. Enter the OTP and reach the authenticated app.
5. Immediately understand the money picture from the summary card.
6. Add a loan in a short form.
7. See the new entry in the ledger and whether it is due or overdue.
8. Open an entry and mark it as repaid.
9. See the list and summary update from the server.

## 2. Goals and non-goals

### Required goals (P0 — must work)

- Phone-number login with a **mock OTP printed in the API server log**. No SMS provider is required or implied.
- Add a loan with friend name, amount, and due date.
- List the authenticated user's loans.
- Highlight overdue, unpaid loans.
- Mark a loan as repaid.
- Show total lent, total repaid, and overdue amount in a prominent summary card at the top of the home screen.
- Persist data in PostgreSQL and scope every read/write to the authenticated owner.
- Share a repository with a usable README and a 2–3 minute demo recording plan.
- Input validation, useful loading/error/empty states, and basic tests.

### Quality goals

- Visually memorable and polished enough to stand out in a crowded internship review.
- Extremely quick to understand; a user should be able to add a loan without guidance.
- Responsive on common Android phone sizes and reasonable on iOS.
- Accessible, smooth, resilient to network errors, and maintainable.
- Code must be simple enough for the applicant to explain in an interview.

### Explicit non-goals

- Real SMS delivery, real banking/payment integration, payment collection, automatic reminders, chat, contacts sync, multiple currencies, partial repayments, recurring loans, or a web dashboard.
- Complex admin panels or multi-tenant organization features.
- Fake financial advice or claims that MiniLedger moves money. It only records a user's ledger.
- Do not add scope that could delay or break the required journey.

## 3. Product information architecture

Keep navigation small and purposeful:

- **Home:** Summary, overdue attention area, recent loans, and clear Add Loan action.
- **Ledger:** Full list with search and status filters.
- **Settings/Profile:** Signed-in phone number, mock-OTP disclosure, and Log out.
- **Add Loan:** A dedicated screen or bottom sheet with a focused form.
- **Loan Details:** Friend, amount, due date, status, created date, and Mark as Repaid action for active loans.
- **Authentication:** Phone entry and OTP verification screens.

Use React Navigation with a native stack for authentication/detail flows and a bottom-tab navigator for Home, Ledger, and Settings. Implement an explicit session gate so auth screens are shown when no valid session exists and protected app screens are inaccessible after logout/session expiry. Avoid duplicate screens that show the same list without a clear purpose.

**Mobile framework constraint:** Build with the React Native Community CLI (bare React Native), not Expo or Expo Router. Commit and maintain the native `android/` and `ios/` projects. Use native CLI commands to run the app on an emulator/device; do not depend on Expo Go, `expo install`, or Expo-managed configuration.

**Styling constraint:** Use **NativeWind v4 with Tailwind CSS v3** as the required styling system. Build screens and reusable components with `className` utility classes on supported React Native components. Define the Calm Confidence color, spacing, radius, and typography tokens centrally in `apps/mobile/tailwind.config.js`; do not scatter raw hex values through UI components. Keep `StyleSheet.create` only for complex dynamic/animated styles or native component props that NativeWind cannot handle. Configure NativeWind for the framework-less React Native CLI setup, not Expo, and verify its styles on an actual Android build.

## 4. Required functional requirements

### 4.1 Phone login and mock OTP

1. Phone screen has a country-code-aware phone input, clear label, validation message, and primary CTA.
2. Default country can be India (`+91`) for the assignment demo, but the stored phone number must be normalized to E.164 format. Do not concatenate country code blindly if the user already entered it.
3. Tapping **Send code** calls the API. Show a loading state and disable repeated taps while loading.
4. The API prints the generated six-digit OTP to the server log in local mock mode. The OTP must not be displayed in the app, returned in an API response, or hardcoded.
5. The verification screen accepts six digits, supports paste/autofill where feasible, has clear focus behavior, shows expiry/resend countdown, and supports returning to edit the phone number.
6. Incorrect/expired/reused OTPs show a useful inline error. Do not clear the whole screen on an incorrect code.
7. Successful verification persists the returned token securely on device and routes to Home.
8. Settings has a working Log out action that clears secure storage and all cached private data before routing to login.
9. OTP is a **demo mechanism**. Document clearly that it must be replaced by an SMS provider before real production use.

### 4.2 Loan creation

Required fields:

- `friendName`: required; trim whitespace; 1–80 characters.
- `amount`: required positive currency amount; maximum two decimal places; maximum configured amount must be finite and safe for the database. Use INR in the UI.
- `dueDate`: required calendar date in `YYYY-MM-DD` format.

Behavior:

- Show labels, example/help text where it aids comprehension, and inline field errors.
- Show the INR currency symbol and numeric keypad for amount entry.
- Allow past due dates so users can enter a loan that is already overdue. Do not impose a future-only constraint.
- Disable submit while invalid/submitting; prevent duplicate submits.
- After a successful save, close/navigate back, refresh both the ledger and summary, and show a small success toast/haptic.
- If the save fails, retain entered values and show a recoverable error.
- Do not invent a friend contact or silently add sample entries.

### 4.3 Loan list

Each loan row/card must show:

- Friend name.
- Amount in INR.
- Due date in a human-friendly format (for example, `Due 21 Oct`).
- Status: **Overdue**, **Due today**, **Upcoming**, or **Repaid**.
- Visually distinct treatment for overdue entries, using both color and a text/icon label (not color alone).

Required status rules:

- `REPAID` always displays Repaid, regardless of its due date.
- `ACTIVE` with due date earlier than the business date displays Overdue.
- `ACTIVE` due today displays Due today.
- Other `ACTIVE` entries display Upcoming.

List behavior:

- Default sort: overdue active loans first, then nearest due date, then newest-created where dates tie. Use a deterministic ordering.
- Provide All, Outstanding, Overdue, and Repaid filters. Filter chips must work, not just be visual.
- Provide search by friend name on the Ledger screen; debounced local or server-side search is fine for this assignment, as long as it works and is documented.
- Pull-to-refresh and a visible refresh/retry route for network failures.
- Loading skeletons, a designed empty state, and an empty-filter state.
- If a list is empty, use a helpful CTA such as **Add your first loan**.

### 4.4 Mark loan as repaid

- Available only for an active loan owned by the current user.
- User opens the loan detail and taps **Mark as repaid**.
- Ask for a lightweight confirmation (native alert or designed confirmation sheet); avoid accidental state changes.
- Call the backend. On success, the detail/list status and all summary totals update from the server.
- Show Repaid status with `repaidAt` where useful. Repaid loans must not contribute to overdue amount.
- Repeated requests must not double-count a repayment. The backend should respond with a clear conflict for a loan already repaid (the client may instead refetch and display the current state).
- Do not implement partial repayment in this version.

### 4.5 Summary

Show the required three amounts clearly at the top of Home:

- **Total lent:** sum of the original amount of every loan created by the user.
- **Total repaid:** sum of amounts for loans whose status is `REPAID`.
- **Overdue amount:** sum of amounts for active loans whose due date is before the business date.

Also show **Outstanding** (`total lent - total repaid`, equivalent to the sum of active loan amounts), because it makes the main headline useful. Additional counts are welcome if they do not clutter the UI.

All amounts must be calculated by the backend for the signed-in user. Never calculate the official summary solely from whichever page of loan rows happens to be loaded. Totals must update after add/repay and remain correct after app restart.

## 5. Premium UI direction

### Design concept: “Calm confidence”

MiniLedger should feel like a thoughtfully designed modern fintech product, not a generic admin dashboard. Aim for premium editorial typography, a confident dark-forest hero card, a warm low-contrast canvas, precise spacing, and delightful motion. It should feel friendly rather than intimidating.

### Color system

Use design tokens; do not scatter hex values throughout screen components. NativeWind utilities should use semantic tokens (for example `bg-background`, `bg-brand`, `text-text-primary`, `rounded-card`, and `px-screen`) defined centrally in Tailwind config. Keep utility classes readable; extract repeated patterns into reusable typed UI components rather than giant class strings copied across screens.

- `background`: warm off-white / pale stone, e.g. `#F6F7F2`.
- `surface`: white, e.g. `#FFFFFF`.
- `surfaceMuted`: pale sage, e.g. `#EEF2E9`.
- `textPrimary`: near-black forest, e.g. `#16231F`.
- `textSecondary`: muted gray-green, e.g. `#68756E`.
- `brand`: deep forest, e.g. `#153E35`.
- `brandAccent`: vivid citrus/mint, e.g. `#D8F36A`.
- `overdue`: accessible warm coral, e.g. `#C94E42` with a pale coral surface.
- `success`: green, e.g. `#247A57`.
- `border`: subtle sage gray, e.g. `#E1E6DE`.

These are starting tokens; validate contrast and adjust if needed. Use the accent sparingly for the main CTA, active filter, small chart/decoration, and micro-interactions. Do not make the entire UI neon. Overdue must be prominent but not panic-inducing.

### Typography

- Use a clean contemporary sans, preferably **Plus Jakarta Sans**, bundled in `apps/mobile/assets/fonts` and linked/configured for the React Native CLI native projects.
- Establish a clear type scale: large financial headline, confident section headings, medium labels, calm metadata.
- Use tabular/lining numerals for money if the font supports them.
- Avoid overusing all caps, tiny labels, excessive bold, or multiple typefaces.
- Respect dynamic font scaling; avoid fixed-height text containers that clip larger fonts.

### Shape, spacing, and materials

- 8-point spacing system with deliberate negative space.
- Cards: approximately 20–28 px corner radius; inputs and buttons approximately 14–18 px.
- Use subtle borders and restrained shadows. No heavy glassmorphism, excessive blur, or dozens of nested cards.
- Use gentle gradients only on the hero summary card or a small accent; ensure contrast remains excellent.
- Use custom reusable primitives: `Screen`, `Button`, `TextField`, `MoneyText`, `StatusPill`, `SummaryCard`, `LoanCard`, `FilterChip`, `EmptyState`, `LoadingSkeleton`, and `Toast`.
- Use a consistent icon family such as `lucide-react-native`. Icons should clarify action, not decorate every label.

### Home screen composition

1. **Header:** MiniLedger wordmark/mark, concise greeting or “Your money, in view”, and a small profile/settings affordance. Do not show a fake notification bell.
2. **Hero summary card:** Deep forest gradient with a subtle original geometric/orbit/ledger-line motif built from native shapes/SVG—no stock photos. Make the primary Outstanding number the largest item. Present Total lent, Total repaid, and Overdue amount as clearly legible secondary figures within the card or its immediate supporting strip. Overdue must not be hidden behind a tap.
3. **Attention section:** If overdue loans exist, show a compact “Needs your attention” section with a count and the most relevant overdue entries. If none exist, replace it with a positive, quiet state—not a warning-shaped empty card.
4. **Recent activity:** Show a handful of recent/nearest-due loans and a clear “View all” route to Ledger.
5. **Primary action:** Persistent, obvious Add Loan action, such as a rounded accent button or floating action button that respects safe areas and does not cover list content.
6. **Navigation:** Minimal bottom navigation with clear active state and correct safe-area insets.

Avoid cramming all metrics, a chart, banners, and multiple actions above the fold. The home view should remain readable on a smaller device. The top summary must remain visible without requiring the user to scroll past a marketing header.

### Loan row/card design

- Friend name and amount are the visual anchors.
- Due date and status are secondary, but easy to scan.
- Overdue items use a pale coral accent, explicit “Overdue” label, and optionally a small clock/alert icon; do not rely on red alone.
- Repaid rows have a calm green label and a restrained check icon.
- Keep tap targets generous. The entire row can open details; nested actions must have unambiguous hit areas.
- Use consistent row heights and avoid layout jumps when loading status changes.

### Add Loan form

- Clear title (“Add a loan”) and one short helper sentence.
- Friend name input, amount input with ₹ prefix, due-date row with selected date, and one dominant Save Loan button.
- Use an appropriate native/calendar date picker styled to fit the system. Past due dates are allowed.
- Keyboard must not cover the focused input or primary CTA. Handle Android back behavior and keyboard dismissal.
- Form must show inline validation and preserve values after server errors.
- Do not add unnecessary fields to the required flow. Receipt attachment is a bonus feature only after P0 works.

### Authentication screens

- Clean brand moment and short trust-building copy; do not pretend the code is sent by SMS when it is only printed in the local server log. The on-screen copy can say “Demo code generated — check the development server log” in development builds, or “Enter the 6-digit code from the developer log” on the verify screen.
- OTP inputs have clear focused/error states, large digits, paste support, accessible labels, resend timer, and a working edit-phone action.
- Do not show a debug OTP banner containing the code inside the app.

### Empty, loading, and failure states

Design all of these as first-class parts of the product:

- First-time empty ledger: warm, simple illustration built from native shapes/icons, encouraging copy, Add Loan CTA.
- No results for a filter/search: “No loans match this view” and a clear reset filter action.
- Loading: stable skeleton placeholders; avoid a whole-screen spinner for every refresh.
- Offline/server failure: clear message, Retry button, and preserve any unsaved form fields.
- Session expired: clear private cached data and route back to authentication.
- Add/repay success: lightweight toast and subtle haptic feedback, without blocking dialogs.

## 6. Motion and haptics

Animation should feel designed, fast, and purposeful—not like a demo reel.

- Use `react-native-reanimated` for interactions that benefit from native-thread animation.
- Screen content: brief fade/translate entrance, about 180–320 ms; stagger small groups only where it improves hierarchy.
- Summary: gently animate the card entrance; optional count-up for monetary values only when data changes, not on every render.
- Loan cards: subtle press feedback (`scale` near `0.985`), with smooth state transition when marked repaid.
- Add Loan sheet/modal: spring-based entrance and clear dismissal gesture if using a sheet.
- Button press: immediate opacity/scale feedback; do not delay the action behind animation.
- Use `react-native-haptic-feedback` lightly for successful save/repay or an important confirmation. Respect device capability and avoid haptics on every tap.
- Respect reduced-motion preferences where feasible; provide a non-animated path. Keep all core actions usable if animation fails.
- Avoid auto-playing decorative loops, over-bouncy springs, fake loading delays, confetti on routine actions, and animations that hide financial values.

## 7. Currency and date rules

- Currency is INR, rendered consistently using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })` or a shared tested formatter.
- Keep monetary calculations in decimal-safe representations. The API should serialize amounts as decimal strings such as `"1250.00"`; never rely on JavaScript floating-point arithmetic for server totals.
- Due dates are date-only values (`YYYY-MM-DD`), not timestamps. This prevents time-zone shifts that can change the displayed calendar day.
- Use `APP_TIMEZONE=Asia/Kolkata` by default for determining the business date. A loan becomes overdue the day after its due date: `dueDate < businessDate` and status is active.
- Example: active loan due on 21 October is “Due today” on 21 October and becomes overdue on 22 October in the configured business timezone.

## 8. Validation and error copy

Use short, non-blaming language. Examples:

- “Enter a valid phone number.”
- “Enter the 6-digit code.”
- “That code is incorrect or has expired. Try again.”
- “Add your friend’s name.”
- “Enter an amount greater than ₹0.”
- “Choose a due date.”
- “Couldn’t save this loan. Your details are still here—try again.”
- “Couldn’t refresh your ledger. Check your connection and retry.”

Avoid raw server traces, SQL messages, or generic “Something went wrong” where a more helpful message is possible. Server logs may contain diagnostics; app users should not see stack traces.

## 9. Accessibility and fit-and-finish

- Minimum practical tap target: 44×44 points.
- Every icon-only button needs an `accessibilityLabel`.
- Use semantic roles/states for buttons, inputs, selected filters, and status indicators.
- Do not convey overdue/repaid state through color alone.
- Verify text contrast and support larger font scaling without clipping or overlapping.
- Keyboard focus order must follow the visual form order; ensure error text is associated with its input.
- Use safe-area insets on all major screens and test small Android screen sizes.
- Support pull-to-refresh, retry, app relaunch/session restore, and logout cleanup.

## 10. Optional bonus (P2 — only after required functionality passes)

Optional receipt attachment can improve distinctiveness, but do not begin it until login, loan create/list/repay, summary, validation, tests, and README all work.

If implemented:

- Let a user pick or capture a receipt image from the Add Loan or Loan Details flow using `react-native-image-picker` (or another maintained React Native CLI-compatible native image picker).
- Validate file type and size on both client and API. Accept only expected image formats.
- Use an upload abstraction: local disk storage for the assignment/demo, an adapter interface for future object storage. Never commit uploaded receipt files or secrets.
- Store a receipt URL/path on the loan; do not store raw binary content in a PostgreSQL text column.
- Use authenticated upload routes and owner checks. Do not expose private uploads publicly without a deliberate access policy.
- Show a thumbnail and an accessible remove/replace action if supported.

Other optional enhancements, in order: tests beyond the core; polished empty/error states; receipt attachment; only then secondary charts or extra settings. Do not build reminders, notifications, payment rails, or partial repayments.

## 11. Product acceptance checklist

### Authentication
- [ ] User requests OTP for a valid phone number.
- [ ] Six-digit OTP appears in the API server log in local mock mode and nowhere in the API response/app UI.
- [ ] Correct unexpired OTP logs in; wrong, expired, reused, and throttled OTPs are handled.
- [ ] Login persists across relaunch; logout clears token and private cache.

### Loans
- [ ] User can add a loan with friend name, positive amount, and due date.
- [ ] Input validation is clear and prevents duplicate submission.
- [ ] Newly added loan persists after restart and appears in the list.
- [ ] Overdue status is calculated correctly and visually obvious.
- [ ] User can mark an owned active loan as repaid.
- [ ] Repaid loans are not counted in overdue amount.
- [ ] User A cannot read or change User B's loans by changing an ID.

### Summary
- [ ] Total lent is sum of all loan amounts owned by the user.
- [ ] Total repaid is sum of repaid loan amounts.
- [ ] Outstanding is sum of active loan amounts.
- [ ] Overdue amount is the sum of active loans with due date before the business date.
- [ ] Values update after add/repay and are correct after relaunch.

### UI and delivery
- [ ] Screens have deliberate loading, error, and empty states.
- [ ] Filters and search work.
- [ ] Motion is smooth and not required for functionality.
- [ ] No fake data in normal use; no visible dead buttons.
- [ ] README gets a new reviewer from clone to running app.
- [ ] Demo clearly shows login, add loan, overdue treatment, repayment, and summary update in 2–3 minutes.
