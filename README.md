# MiniLedger — Personal Loan Ledger

> A production-grade, full-stack personal loan ledger built with a bare **React Native CLI** mobile frontend, **NativeWind v4 + Tailwind CSS v3**, **Node.js + TypeScript** API, and **PostgreSQL 16** persistence.

---

## Table of Contents

1. [Overview & Highlights](#overview--highlights)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Design System — Calm Confidence](#design-system--calm-confidence)
4. [Prerequisites](#prerequisites)
5. [Quick Start & Setup Instructions](#quick-start--setup-instructions)
6. [Starting the API & Database](#starting-the-api--database)
7. [Starting the Mobile Application](#starting-the-mobile-application)
8. [Mock OTP Authentication Workflow](#mock-otp-authentication-workflow)
9. [Automated Test Suite & Verification](#automated-test-suite--verification)
10. [API Specification & Endpoints](#api-specification--endpoints)
11. [2–3 Minute Demo Walkthrough Sequence](#23-minute-demo-walkthrough-sequence)
12. [Security, Limitations & Evaluation Disclosures](#security-limitations--evaluation-disclosures)

---

## 1. Overview & Highlights

**MiniLedger** is built to solve personal informal lending tracking with financial precision and a serene, clutter-free user experience. Users can record loans extended to friends, view real-time financial metrics, distinguish overdue receivables at a glance, and record repayments with atomic updates.

### Key Capabilities
- **Strict User Isolation**: All records, summaries, and OTP challenges are strictly scoped to the authenticated user ID extracted from cryptographically verified JWT tokens.
- **Decimal-Safe Financial Arithmetic**: Eliminates IEEE-754 floating-point inaccuracies using PostgreSQL native `DECIMAL(12, 2)` representations and string-serialized numeric contracts.
- **Date Boundary Correctness**: Evaluates loan overdue status against a centralized `Asia/Kolkata` business-date calendar (`dueDate < businessDate`; due today is active, not overdue).
- **Mock OTP Login**: Phone number sign-in with 6-digit mock OTP codes printed exclusively to the local API development terminal.
- **Zero Mock UI Data**: 100% data-driven mobile frontend powered by TanStack Query and optimistic cache invalidation.

---

## 2. Architecture & Technology Stack

The project is structured as a clean npm monorepo workspace:

```
MiniLedger/
├── apps/
│   ├── api/                   # Node.js + Express + TypeScript Backend
│   │   ├── drizzle/           # Generated SQL migration files
│   │   ├── src/
│   │   │   ├── config/        # Environment validation via Zod
│   │   │   ├── db/            # PostgreSQL connection & Drizzle ORM schema
│   │   │   ├── lib/           # Dates, money arithmetic & JWT token utilities
│   │   │   ├── middleware/    # Auth, Request-ID, CORS, rate-limits & error handling
│   │   │   └── modules/       # Auth, Loans & Summary controllers and routes
│   │   └── tests/             # Vitest unit & integration test suite (15/15 passing)
│   │
│   └── mobile/                # Bare React Native CLI (React Native 0.88)
│       ├── android/           # Committed native Android project
│       ├── ios/               # Committed native iOS project
│       ├── src/
│       │   ├── components/ui/ # Reusable UI primitives (Button, TextField, Card, Pill)
│       │   ├── features/      # Typed API client, hooks & auth session context
│       │   ├── navigation/    # Session-aware root, stack & tab navigators
│       │   ├── screens/       # Login, OTP, Dashboard, Ledger, Add Loan, Loan Details
│       │   ├── theme/         # Centralized Tailwind color tokens
│       │   └── utils/         # Currency and localized date formatters
│       ├── tailwind.config.js # Tailwind CSS v3 configuration
│       └── global.css         # NativeWind entry stylesheet
│
├── packages/
│   └── contracts/             # Shared TypeScript DTOs and Zod validation schemas
│       └── src/
│           ├── auth.ts        # Phone regex, OTP request & verify contracts
│           ├── loan.ts        # Loan CRUD, query filters, sort & pagination schemas
│           └── summary.ts     # Financial summary metrics contract
│
├── docker-compose.yml         # Containerized PostgreSQL 16 Alpine configuration
└── package.json               # Root monorepo scripts & workspaces
```

### Core Technologies
- **Mobile Frontend**: React Native `0.88.0` (Bare CLI, **no Expo**), NativeWind `4.2.7` + Tailwind CSS `3.4.17`, React Navigation `7.x`, React Native Screens `4.x`, Safe Area Context, React Native Keychain.
- **Backend API**: Node.js `22.x/24.x`, Express `4.21.x`, TypeScript `5.6.x` (strict mode), Drizzle ORM `0.36.x`, PostgreSQL `16`, `jose` JWT authentication.
- **Contracts**: Shared Zod schemas ensuring runtime type guarantees at all client-server boundaries.
- **Database**: PostgreSQL with transactional single-use OTP validation and atomic repayment transitions.

---

## 3. Design System — Calm Confidence

MiniLedger follows the **Calm Confidence** fintech design philosophy:
- **Palette**: Deep forest green (`#153E35`), warm ivory background (`#F6F7F2`), crisp white cards (`#FFFFFF`), citrus accent (`#D8F36A`), and warm coral for overdue attention (`#C94E42`).
- **Typography & Spacing**: Clean hierarchy, generous padding, and high-contrast numerical figures for instant legibility.
- **State Handling**: Comprehensive states for all screens — loading skeletons, empty states with clear CTAs, validation errors, and success feedback.

---

## 4. Prerequisites

Ensure your development workstation has:
1. **Node.js**: `v20.x` or `v22.x` (or newer LTS).
2. **Docker Desktop**: Running for PostgreSQL containerization.
3. **Android Studio**: Android SDK, Platform Tools (`adb`), and OpenJDK 17 configured (`ANDROID_HOME` in environment variables).

---

## 5. Quick Start & Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/MiniLedger.git
cd MiniLedger
```

### 2. Install dependencies
```bash
npm install
```

---

## 6. Starting the API & Database

### 1. Start the PostgreSQL Container
```bash
npm run db:up
```
*(Starts PostgreSQL 16 on port `5432` with username `miniledger`, password `miniledger_dev`, database `miniledger`)*

### 2. Apply Database Migrations
```bash
npm run db:migrate
```
*(Runs Drizzle migrations located in `apps/api/drizzle/` to create `users`, `otp_challenges`, and `loans` tables)*

### 3. Configure API Environment
Copy the example environment file if you haven't already:
```bash
cp apps/api/.env.example apps/api/.env
```

Default configuration in `apps/api/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://miniledger:miniledger_dev@localhost:5432/miniledger
JWT_SECRET=super-secret-development-jwt-key-min-32-chars-long!
JWT_EXPIRES_IN=30d
OTP_EXPIRY_SECONDS=300
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

### 4. Start the API Server
```bash
npm run dev:api
```
The server will start at `http://localhost:3000`. Test the health endpoint:
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-10-22T...","service":"miniledger-api"}
```

---

## 7. Starting the Mobile Application

### 1. Reverse Port Forwarding for Android
If testing on an Android Emulator or connected physical device:
```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

> **Physical Device LAN Connection Tip**: If using a physical Android device without `adb reverse`, update `apps/mobile/src/lib/api-client.ts` to point to your computer's local Wi-Fi IP address (e.g., `http://192.168.1.15:3000/api/v1`).

### 2. Start Metro Bundler
In a separate terminal window:
```bash
npm run dev:mobile
```

### 3. Build & Launch Android App
In another terminal window:
```bash
npm run dev:android
```

---

## 8. Mock OTP Authentication Workflow

MiniLedger uses a developer-friendly Mock OTP authentication adapter:
1. Open the mobile app and enter any valid 10-digit Indian phone number (e.g. `9876543210`).
2. Tap **Continue with Phone**.
3. Look at your **API server terminal**. You will see the generated 6-digit OTP formatted as follows:

```
=======================================================
🔑 [MINILEDGER DEMO OTP]
📱 Phone: +91*****43210
👉 Code:  482915
⏳ Valid for 5 minutes
=======================================================
```

4. Enter the 6-digit code in the mobile OTP screen.
5. Verification automatically succeeds, securely persists the JWT token in the device Keychain, and navigates to the financial dashboard.

---

## 9. Automated Test Suite & Verification

The backend includes a comprehensive automated test suite covering authentication, authorization, loan lifecycle, and business date calculations:

```bash
# Run all backend tests
npm run test
```

### Test Coverage Highlights
- ✅ **Mock OTP Security**: OTP is never exposed in API responses; expired and multi-use OTPs are rejected; 5-attempt brute-force threshold locks challenge.
- ✅ **User Isolation**: User A cannot read, update, or repay User B's loans. User summaries only compute the authenticated user's records.
- ✅ **Business Date Overdue Logic**: Evaluated against `Asia/Kolkata`. A loan due today is strictly **not overdue**; a loan due yesterday is **overdue**.
- ✅ **Atomic Repayment**: Transitions active loans to repaid status; subsequent duplicate repayment requests return `409 Conflict`.
- ✅ **Typecheck Verification**: Run `npm run typecheck` across all packages and apps (0 errors).

---

## 10. API Specification & Endpoints

Base path: `/api/v1`

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `GET` | `/health` | No | Server health and timestamp check |
| `POST` | `/api/v1/auth/otp/request` | No | Request mock OTP for phone number (throttled to 60s) |
| `POST` | `/api/v1/auth/otp/verify` | No | Verify 6-digit OTP; returns JWT access token & user profile |
| `GET` | `/api/v1/auth/me` | Bearer | Retrieve profile for authenticated user session |
| `GET` | `/api/v1/summary` | Bearer | Compute financial metrics (Total Lent, Repaid, Overdue, Outstanding) |
| `GET` | `/api/v1/loans` | Bearer | List loans with pagination, `status` filter (`all`, `outstanding`, `overdue`, `repaid`), `search`, and `sort` |
| `POST` | `/api/v1/loans` | Bearer | Create a new loan record (`friendName`, `amount`, `dueDate`) |
| `GET` | `/api/v1/loans/:id` | Bearer | Retrieve details for a single loan |
| `PATCH`| `/api/v1/loans/:id/repay` | Bearer | Mark an active loan as repaid atomically |

---

## 11. 2–3 Minute Demo Walkthrough Sequence

For your demonstration video:

1. **0:00 – 0:25 — Branding & Authentication**
   - Open MiniLedger; highlight the Calm Confidence theme and clean typography.
   - Enter a test phone number (`9876543210`) and press **Continue with Phone**.
   - Show the API terminal log printing the `[MINILEDGER DEMO OTP]` code.
   - Enter the 6 digits on the screen; auto-submits and transitions to the Dashboard.

2. **0:25 – 0:55 — Dashboard Financial Summary**
   - Point out the 4 server-calculated metrics: Total Lent, Total Repaid, Overdue Amount, and Outstanding Net.
   - Emphasize that all numbers are computed in PostgreSQL with decimal safety.

3. **0:55 – 1:30 — Recording a New Loan**
   - Tap **+ New Loan**.
   - Demonstrate client and server input validation (name required, positive amount, valid date).
   - Enter a friend's name (e.g., `Rahul Verma`), an amount (e.g., `2500.00`), and choose a **past due date** to demonstrate overdue detection.
   - Tap **Record Loan**.

4. **1:30 – 2:00 — Overdue Highlight & Filtering**
   - On the Dashboard, observe the new loan appear in the **Attention Needed (Overdue)** section with a coral warning indicator.
   - Switch to the **Ledger** tab.
   - Test filter chips: **All**, **Outstanding**, **Overdue**, and **Repaid**.
   - Use the live search bar to filter by name.

5. **2:00 – 2:30 — Mark as Repaid & Summary Auto-Refresh**
   - Tap on the overdue loan to open **Loan Details**.
   - Tap **Mark as Repaid** and confirm in the alert dialog.
   - Notice the status immediately changes to **Repaid** with a green badge.
   - Navigate back to the Dashboard: observe the **Total Repaid** increase, **Overdue Amount** drop to ₹0, and **Outstanding Net** recalculate automatically.

6. **2:30 – 2:50 — Session Persistence & Sign Out**
   - Navigate to the **Account** tab.
   - Review the Developer Mock OTP disclosure and technical architecture details.
   - Tap **Sign Out** to securely clear Keychain credentials and reset cache.

---

## 12. Security, Limitations & Evaluation Disclosures

- **Mock OTP Adapter**: In local development, OTP codes are printed to the server log rather than transmitted via commercial SMS gateways (Twilio/AWS SNS) to enable friction-free testing.
- **Secure Token Storage**: The client utilizes `react-native-keychain` to store bearer JWT tokens in encrypted hardware-backed storage on supported devices.
- **Financial Arithmetic**: Floating point `number` sums are avoided on both the backend and database layer to guarantee financial accounting precision.

---

*Crafted with attention to detail for the MiniLedger internship assignment.*
