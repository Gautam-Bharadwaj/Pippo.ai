# Gautam — Frontend Lead Task Document
## Sperto Dashboard · Next.js 15 · TypeScript · Tailwind CSS

> **Role**: Frontend & UI/UX Lead 
> **Stack**: Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · TanStack Query · Recharts · Framer Motion 
> **Backend URL**: `http://localhost:4000` (Yogesh's server) 
> **Your Dev Port**: `3000`

---

## Quick Start (Day 1 — Run These First)

```bash
# Navigate to your workspace
cd apps/web

# Install all dependencies
npm install

# Start dev server
npm run dev
```

**Frontend will be live at**: `http://localhost:3000`

---

## Your Folder Structure (Create Exactly This)

```
apps/web/
├── src/
│ ├── app/
│ │ ├── (auth)/
│ │ │ ├── login/page.tsx
│ │ │ ├── forgot-password/page.tsx
│ │ │ └── reset-password/page.tsx
│ │ ├── (dashboard)/
│ │ │ ├── layout.tsx ← Sidebar + Header shell
│ │ │ ├── page.tsx ← Role-based redirect
│ │ │ ├── sessions/
│ │ │ │ ├── page.tsx ← Session history table
│ │ │ │ └── live/page.tsx ← Live monitor
│ │ │ ├── present/page.tsx ← SM Presentation workflow
│ │ │ ├── devices/page.tsx
│ │ │ ├── customers/page.tsx
│ │ │ ├── managers/page.tsx
│ │ │ ├── analytics/page.tsx
│ │ │ ├── reports/page.tsx
│ │ │ ├── logs/page.tsx
│ │ │ ├── users/page.tsx
│ │ │ └── settings/page.tsx
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Sidebar.tsx
│ │ │ ├── Header.tsx
│ │ │ ├── Breadcrumb.tsx
│ │ │ └── NotificationPanel.tsx
│ │ ├── auth/
│ │ │ ├── LoginForm.tsx
│ │ │ ├── ForgotPasswordForm.tsx
│ │ │ └── ResetPasswordForm.tsx
│ │ ├── dashboard/
│ │ │ ├── KPICard.tsx
│ │ │ ├── KPIGrid.tsx
│ │ │ ├── LiveSessionsTable.tsx
│ │ │ └── RecentActivity.tsx
│ │ ├── sessions/
│ │ │ ├── SessionsTable.tsx
│ │ │ ├── SessionFilters.tsx
│ │ │ ├── SessionStatusBadge.tsx
│ │ │ └── SessionTimer.tsx ← Live clock
│ │ ├── presentation/
│ │ │ ├── CustomerValidator.tsx
│ │ │ ├── PresentationControls.tsx
│ │ │ └── ActiveSessionBanner.tsx
│ │ ├── charts/
│ │ │ ├── SessionsPerDayChart.tsx
│ │ │ ├── SessionsPerHourChart.tsx
│ │ │ ├── DeviceUsageChart.tsx
│ │ │ └── ManagerPerformanceChart.tsx
│ │ ├── devices/
│ │ │ ├── DevicesTable.tsx
│ │ │ └── DeviceForm.tsx
│ │ └── common/
│ │ ├── DataTable.tsx
│ │ ├── SearchInput.tsx
│ │ ├── ExportButton.tsx
│ │ ├── EmptyState.tsx
│ │ ├── LoadingSkeleton.tsx
│ │ ├── ErrorBoundary.tsx
│ │ └── ThemeSwitcher.tsx
│ ├── store/
│ │ ├── authStore.ts
│ │ ├── sessionStore.ts
│ │ └── notificationStore.ts
│ ├── hooks/
│ │ ├── useAuth.ts
│ │ ├── useLiveTimer.ts
│ │ ├── useSession.ts
│ │ └── useAnalytics.ts
│ ├── lib/
│ │ ├── api.ts ← Axios instance + interceptors
│ │ ├── queryClient.ts
│ │ └── utils.ts
│ ├── services/
│ │ ├── auth.service.ts
│ │ ├── session.service.ts
│ │ ├── device.service.ts
│ │ ├── customer.service.ts
│ │ ├── analytics.service.ts
│ │ └── report.service.ts
│ ├── types/
│ │ ├── auth.types.ts
│ │ ├── session.types.ts
│ │ └── api.types.ts
│ ├── constants/
│ │ ├── routes.ts
│ │ └── permissions.ts
│ └── middleware.ts ← Route protection
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── components.json ← shadcn config
└── package.json
```

---

## Task Checklist (In Order)

---

### Phase 0: Project Bootstrap (Day 1)

- [ ] **Initialize Next.js 15 project**
 ```bash
 cd /path/to/Dashboard
 npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir --no-git
 cd apps/web
 ```

- [ ] **Install all required packages**
 ```bash
 npm install \
 @tanstack/react-query \
 axios \
 zustand \
 react-hook-form \
 @hookform/resolvers \
 zod \
 framer-motion \
 recharts \
 lucide-react \
 sonner \
 class-variance-authority \
 clsx \
 tailwind-merge \
 date-fns
 ```

- [ ] **Install shadcn/ui**
 ```bash
 npx shadcn@latest init
 # Choose: Default style, Slate base color, CSS variables
 ```

- [ ] **Add shadcn components you'll use**
 ```bash
 npx shadcn@latest add button card dialog input label \
 select table badge avatar dropdown-menu sheet \
 toast separator skeleton progress command
 ```

- [ ] **Create `.env.local`**
 ```env
 NEXT_PUBLIC_API_URL=http://localhost:4000
 ```

---

### Phase 1: Design System & Layout (Days 2–3)

- [ ] **`globals.css`** — Set up CSS variables for light/dark themes, custom fonts (Inter from Google Fonts), color tokens, animations

- [ ] **`tailwind.config.ts`** — Add custom colors, animations, font family

- [ ] **`Sidebar.tsx`** — Collapsible sidebar with:
 - Logo area
 - Nav links (different per role from `permissions.ts`)
 - User profile card at bottom
 - Collapse/expand toggle
 - Active link highlighting

- [ ] **`Header.tsx`** — Top bar with:
 - Breadcrumb component (auto-generated from route)
 - Global search input
 - Notification bell (with unread count badge)
 - User avatar with dropdown (Profile, Settings, Logout)
 - ThemeSwitcher toggle

- [ ] **`(dashboard)/layout.tsx`** — Compose sidebar + header + main content area

- [ ] **`ThemeSwitcher.tsx`** — Light/dark toggle using `next-themes`
 ```bash
 npm install next-themes
 ```

- [ ] **`middleware.ts`** — Next.js route protection:
 - Unauthenticated → redirect to `/login`
 - `SALES_MANAGER` accessing `/devices`, `/logs`, etc. → redirect to `/dashboard`

---

### Phase 2: Authentication Pages (Days 3–4)

- [ ] **`lib/api.ts`** — Axios instance:
 - `baseURL` = `process.env.NEXT_PUBLIC_API_URL`
 - Request interceptor: attach `Bearer {token}` from Zustand store
 - Response interceptor: on 401 → call `/auth/refresh` → retry original request → on refresh fail → logout + redirect `/login`

- [ ] **`store/authStore.ts`** — Zustand store:
 ```typescript
 interface AuthStore {
 user: User | null
 accessToken: string | null
 isAuthenticated: boolean
 setAuth(user, token): void
 clearAuth(): void
 }
 ```

- [ ] **`services/auth.service.ts`** — Functions:
 - `login(email, password)`
 - `logout()`
 - `forgotPassword(email)`
 - `resetPassword(token, newPassword)`
 - `refreshToken()`

- [ ] **`(auth)/login/page.tsx`** — Login page:
 - Email + password form using React Hook Form + Zod
 - "Forgot password?" link
 - Show/hide password toggle
 - Loading spinner on submit
 - Error message on failed login
 - Redirect to `/dashboard` on success
 - Smooth entrance animation (Framer Motion)

- [ ] **`(auth)/forgot-password/page.tsx`** — Forgot password page:
 - Email input + submit
 - Success state: "Check your inbox" message
 - Back to login link

- [ ] **`(auth)/reset-password/page.tsx`** — Reset password page:
 - Read `?token=` from URL params
 - New password + confirm password fields
 - Password strength indicator
 - Success → redirect to login

---

### Phase 3: Admin Dashboard (Days 5–7)

- [ ] **`components/dashboard/KPICard.tsx`** — Reusable card component:
 - Title, value, icon, trend indicator (+/- vs yesterday)
 - Skeleton loading state
 - Framer Motion count-up animation

- [ ] **`components/dashboard/KPIGrid.tsx`** — Grid of 9 KPI cards:
 - Total Sessions Today
 - Active Sessions (with pulsing green dot)
 - Devices Online
 - Registered Devices
 - Total Customers
 - Total Sales Managers
 - Average Session Time
 - Longest Session
 - Shortest Session
 - Data from: `GET /api/analytics/overview`

- [ ] **`components/dashboard/LiveSessionsTable.tsx`** — Auto-refreshing table:
 - TanStack Query with `refetchInterval: 10000` (every 10 seconds)
 - Columns: Device, Customer, Sales Manager, Started, Timer, Status
 - Each row shows a running timer (client-side `useLiveTimer` hook)
 - Status badge (Active = green pulse, Completed = grey)
 - Empty state: "No active sessions"
 - Data from: `GET /api/sessions/live`

- [ ] **`(dashboard)/page.tsx`** — Main dashboard page:
 - Show `KPIGrid` + `LiveSessionsTable` + Sessions per day chart
 - Role check: if `SALES_MANAGER` → show SM dashboard instead

---

### Phase 4: Sales Manager Dashboard & Presentation Workflow (Days 6–8)

**This is the most important feature — build carefully.**

- [ ] **`hooks/useLiveTimer.ts`** — Custom hook:
 ```typescript
 // Returns formatted time string "00:12:34"
 // Updates every second using setInterval
 // Clears interval on unmount
 const useLiveTimer = (startTime: string | null) => string
 ```

- [ ] **`store/sessionStore.ts`** — Zustand store:
 ```typescript
 interface SessionStore {
 activeSession: Session | null
 customerId: string
 customerName: string
 startTime: string | null
 setActiveSession(session): void
 clearSession(): void
 }
 ```

- [ ] **`components/presentation/CustomerValidator.tsx`**:
 - Input field: "Enter Customer Lead ID"
 - "Validate Customer" button (calls `POST /api/sperto/validate-customer`)
 - Loading state on button
 - On success: show customer card (name + lead ID) with green checkmark
 - On error: red error message
 - "Clear" button to reset

- [ ] **`components/presentation/PresentationControls.tsx`**:
 - "Start Presentation" button (green, large, prominent)
 - Disabled until customer validated
 - Confirmation modal before starting
 - Calls `POST /api/sessions/start`
 - "End Presentation" button (red, large)
 - Only shown when session is active
 - Confirmation modal showing duration so far
 - Calls `POST /api/sessions/end`

- [ ] **`components/presentation/ActiveSessionBanner.tsx`**:
 - Shows when a session is active
 - Displays: Customer name, Device ID, Live timer (using `useLiveTimer`)
 - Pulsing green border/indicator
 - End Presentation button

- [ ] **`(dashboard)/present/page.tsx`** — Full SM presentation page:
 - Step 1: `CustomerValidator`
 - Step 2: `PresentationControls` (enabled after validation)
 - Step 3: `ActiveSessionBanner` (when session running)
 - Step 4: Session summary card (after session ends)

---

### Phase 5: Sessions History Page (Days 8–9)

- [ ] **`components/common/DataTable.tsx`** — Reusable table component using TanStack Table:
 - Server-side pagination
 - Column sorting (click header → toggle asc/desc)
 - Row selection (checkboxes)
 - Configurable columns via props
 - Loading skeleton (5 ghost rows)
 - Empty state component

- [ ] **`components/sessions/SessionFilters.tsx`** — Filter panel:
 - Date range picker (Today / Last 7 Days / Custom)
 - Device dropdown
 - Status dropdown (All / Active / Completed / Interrupted)
 - Search input (debounced 300ms)
 - "Clear Filters" button

- [ ] **`components/sessions/SessionStatusBadge.tsx`** — Colored badge:
 - ACTIVE → green
 - COMPLETED → blue
 - INTERRUPTED → orange

- [ ] **`(dashboard)/sessions/page.tsx`** — Session history page:
 - `SessionFilters` + `DataTable`
 - Columns: ID, Device, Customer, Sales Manager, Start Time, End Time, Duration, Status
 - Export button → `GET /api/reports/export?format=csv`
 - Admin sees all sessions, SM sees only their own

---

### Phase 6: Live Sessions Monitor (Day 9)

- [ ] **`(dashboard)/sessions/live/page.tsx`** — Real-time monitor:
 - Connect to `GET /api/sessions/stream` (SSE)
 - Use `EventSource` API
 - Show "🟢 Live" indicator when connected
 - Table updates in real-time as sessions start/end
 - Each row has running client-side timer
 - Animate new rows sliding in, ended rows fading out (Framer Motion)
 - "Disconnected" banner with auto-retry if connection drops

---

### Phase 7: Devices, Customers & Managers Pages (Days 9–11)

- [ ] **`(dashboard)/devices/page.tsx`**:
 - Device cards grid + table
 - Status badges (Online/Offline/Disabled)
 - "Register Device" button → modal with form
 - "Assign" button → modal with Sales Manager dropdown
 - "Disable" button with confirmation

- [ ] **`(dashboard)/customers/page.tsx`**:
 - Customer list table
 - Columns: Name, Lead ID, Total Visits, Last Visit, Avg Duration
 - Search by name or lead ID

- [ ] **`(dashboard)/managers/page.tsx`**:
 - Manager cards with avatar (initials fallback)
 - Today's sessions / Weekly / Monthly counts
 - Average session duration
 - Last active timestamp

- [ ] **`(dashboard)/users/page.tsx`** (Admin only):
 - Users table
 - "Add User" button → modal
 - Edit/Disable actions per row

---

### Phase 8: Analytics Page (Days 11–12)

- [ ] **`(dashboard)/analytics/page.tsx`** — 2-column chart grid

- [ ] **`components/charts/SessionsPerDayChart.tsx`**:
 - Recharts `AreaChart`
 - Data: `GET /api/analytics/sessions-per-day`
 - Gradient fill, custom tooltip

- [ ] **`components/charts/SessionsPerHourChart.tsx`**:
 - Recharts `BarChart`
 - Data: `GET /api/analytics/sessions-per-hour`
 - Hour labels on X axis

- [ ] **`components/charts/DeviceUsageChart.tsx`**:
 - Recharts `PieChart` / `RadialBarChart`
 - Data: `GET /api/analytics/device-usage`
 - Legend with device names

- [ ] **`components/charts/ManagerPerformanceChart.tsx`**:
 - Recharts horizontal `BarChart`
 - Data: `GET /api/analytics/manager-performance`
 - Sessions count per manager

- [ ] All charts:
 - Date range picker to filter
 - Loading skeleton (grey placeholder)
 - Error fallback with retry button
 - Recharts custom tooltip styling

---

### Phase 9: Reports Page (Day 12)

- [ ] **`(dashboard)/reports/page.tsx`**:
 - Report type dropdown: Daily / Weekly / Monthly / Session
 - Date range picker
 - Format selector: CSV / Excel / PDF
 - "Generate & Download" button
 - Calls: `GET /api/reports/export?format=csv&from=&to=`
 - Show loading state: "Preparing report..."
 - Auto-download file on success

---

### Phase 10: API Logs Page (Day 12–13)

- [ ] **`(dashboard)/logs/page.tsx`**:
 - Table of all API log entries
 - Columns: Endpoint, Status (/), HTTP Code, Duration (ms), Timestamp
 - Expandable rows: show Request Payload + Response Payload (JSON)
 - Filter: All / Success only / Failed only
 - "Retry" button on failed rows (calls `POST /api/logs/:id/retry`)
 - Retry button disabled on read-only calls

---

### Phase 11: Notifications (Days 11–12)

- [ ] **`store/notificationStore.ts`** — Zustand store for notification list + unread count

- [ ] **`components/layout/NotificationPanel.tsx`**:
 - Slide-in panel when bell clicked
 - List of notifications (session started, ended, API error)
 - "Mark all as read" button
 - Empty state
 - Time ago labels (e.g., "2 minutes ago")

- [ ] **Toast notifications** using `sonner`:
 - Login success → green toast
 - Session started → green toast
 - Session ended → green toast with duration
 - API error → red toast with "retry" action button
 - Session timeout warning → orange toast

---

### ️ Phase 12: Settings Page (Day 13)

- [ ] **`(dashboard)/settings/page.tsx`**:
 - **Profile section**: Update name, avatar upload (or initials-based)
 - **Password section**: Current password + new password form
 - **Theme section**: Light/Dark toggle with live preview
 - **Notification preferences** (on/off toggles)
 - All sections use React Hook Form + Zod

---

## API Calls Reference (Your Service Layer)

| Service File | API Call | Method |
|---|---|---|
| `auth.service.ts` | `/api/auth/login` | POST |
| `auth.service.ts` | `/api/auth/refresh` | POST |
| `auth.service.ts` | `/api/auth/logout` | POST |
| `auth.service.ts` | `/api/auth/forgot-password` | POST |
| `auth.service.ts` | `/api/auth/reset-password` | POST |
| `session.service.ts` | `/api/sessions` | GET |
| `session.service.ts` | `/api/sessions/live` | GET |
| `session.service.ts` | `/api/sessions/start` | POST |
| `session.service.ts` | `/api/sessions/end` | POST |
| `session.service.ts` | `/api/sessions/stream` | GET (SSE) |
| `device.service.ts` | `/api/devices` | GET |
| `device.service.ts` | `/api/devices` | POST |
| `device.service.ts` | `/api/devices/:id/assign` | PATCH |
| `analytics.service.ts` | `/api/analytics/overview` | GET |
| `analytics.service.ts` | `/api/analytics/sessions-per-day` | GET |
| `analytics.service.ts` | `/api/analytics/sessions-per-hour` | GET |
| `analytics.service.ts` | `/api/analytics/device-usage` | GET |
| `analytics.service.ts` | `/api/analytics/manager-performance` | GET |
| `report.service.ts` | `/api/reports/export` | GET |
| (inline in logs page) | `/api/logs` | GET |
| (inline in logs page) | `/api/logs/:id/retry` | POST |
| (inline in validator) | `/api/sperto/validate-customer` | POST |
| (inline in users page) | `/api/users` | GET/POST/PATCH |

---

## What to Test Before Handing to Yogesh

- [ ] Login as Admin → lands on admin dashboard
- [ ] Login as SM → lands on SM dashboard only (no sidebar admin links)
- [ ] SM: Try to visit `/devices` → gets redirected away
- [ ] SM: Enter lead ID → see customer name → start session → timer runs → end session → see summary
- [ ] Admin: See live sessions table update when SM starts/ends
- [ ] Admin: Export CSV report and verify download works
- [ ] Token expiry: Wait 15 min or clear token → auto-refresh works
- [ ] Dark mode toggle works and persists on refresh

---

## What You Need from Yogesh (Ask Him First)

1. **Backend must be running** on `http://localhost:4000` before you test API calls
2. **Ask him for seed credentials** → `admin@sperto.com / admin123` and `manager1@sperto.com / manager123`
3. **Sperto API key** — if he's using mock mode you don't need it; test with `lead-001`, `lead-002`, `lead-003`
4. **Notify him** when SSE stream page is ready so he can verify events are being received

---

## Sync Points with Yogesh

| Day | What to sync |
|---|---|
| Day 1 | Confirm API base URL and test `/api/health` returns 200 |
| Day 3 | Test login API from your LoginForm — confirm JWT works |
| Day 6 | Test `POST /api/sessions/start` end-to-end with Sperto mock |
| Day 9 | Test SSE stream on live sessions page |
| Day 13 | Full integration test together |

---

*Document owner: Gautam · Last updated: June 30, 2026*
