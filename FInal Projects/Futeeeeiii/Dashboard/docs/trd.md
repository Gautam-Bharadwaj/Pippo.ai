# TRD — Technical Requirements Document
## Sperto Dashboard & API Integration System

> **Document Version**: 1.0.0 
> **Date**: June 30, 2026 
> **Technical Lead**: Gautam (Frontend) · Yogesh (Backend) 
> **Status**: Draft 
> **Classification**: Internal · Confidential

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Database Design](#3-database-design)
4. [Authentication Architecture](#4-authentication-architecture)
5. [API Contract](#5-api-contract)
6. [Sperto API Integration](#6-sperto-api-integration)
7. [Frontend Architecture](#7-frontend-architecture)
8. [State Management](#8-state-management)
9. [Security Architecture](#9-security-architecture)
10. [Real-Time Communication](#10-real-time-communication)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Performance Requirements](#12-performance-requirements)
13. [Infrastructure & Deployment](#13-infrastructure--deployment)
14. [Logging & Monitoring](#14-logging--monitoring)
15. [Testing Requirements](#15-testing-requirements)

---

## 1. Technology Stack

### 1.1 Full Stack Decision Table

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Frontend Framework** | Next.js | 15.x | App Router, SSR, file-based routing, Vercel-optimized |
| **Frontend Language** | TypeScript | 5.x | End-to-end type safety, better DX |
| **Styling** | Tailwind CSS | 3.x | Utility-first, design tokens, purge unused styles |
| **UI Component Library** | shadcn/ui | Latest | Accessible, unstyled base, full code ownership |
| **Server State** | TanStack Query | 5.x | Caching, auto-refresh, background sync, optimistic updates |
| **Client State** | Zustand | 4.x | Minimal boilerplate, TypeScript-first, devtools |
| **Forms** | React Hook Form | 7.x | Uncontrolled, performant, works with Zod |
| **Validation (FE)** | Zod | 3.x | Runtime + compile-time schema validation |
| **Animations** | Framer Motion | 11.x | Production-grade React animations |
| **Charts** | Recharts | 2.x | React-native, composable, SVG-based |
| **HTTP Client** | Axios | 1.x | Interceptors, error handling, request/response transform |
| **Backend Framework** | Express.js | 4.x | Lightweight, middleware-rich, vast ecosystem |
| **Backend Language** | TypeScript | 5.x | Consistent with frontend types |
| **ORM** | Prisma | 5.x | Type-safe queries, auto-migrations, studio UI |
| **Database** | PostgreSQL | 16.x | ACID, JSON support, robust, production-proven |
| **Cache / Rate Limit** | Redis | 7.x | Fast in-memory, rate limit store |
| **Authentication** | JWT (jsonwebtoken) | 9.x | Stateless, widely supported |
| **Password Hashing** | bcrypt | 5.x | Industry standard, configurable rounds |
| **Validation (BE)** | Zod | 3.x | Consistent with frontend |
| **Logging** | Winston | 3.x | Structured JSON logs, multiple transports |
| **HTTP Security** | Helmet.js | 7.x | 15+ security headers in one package |
| **Rate Limiting** | express-rate-limit | 7.x | Simple, Redis-backed |
| **PDF Export** | PDFKit | 0.15.x | Node.js PDF generation |
| **Excel Export** | ExcelJS | 4.x | Full Excel support from Node.js |
| **Real-Time** | Server-Sent Events | Native | One-way server push, no WS overhead |
| **Containerization** | Docker + Docker Compose | Latest | Reproducible environments |
| **Reverse Proxy** | Nginx | 1.25.x | SSL termination, routing, static files |
| **Testing (Unit)** | Jest + Testing Library | Latest | Industry standard |
| **Testing (E2E)** | Playwright | 1.x | Cross-browser, reliable, fast |

### 1.2 Technology Dependency Graph

```mermaid
graph TB
 subgraph FE["Frontend Dependencies"]
 Next15["Next.js 15"] --> TS["TypeScript 5"]
 Next15 --> Tailwind["Tailwind CSS 3"]
 Next15 --> shadcn["shadcn/ui"]
 Next15 --> TanStack["TanStack Query 5"]
 Next15 --> Zustand["Zustand 4"]
 Next15 --> RHF["React Hook Form 7"]
 Next15 --> Zod_FE["Zod 3"]
 Next15 --> Framer["Framer Motion 11"]
 Next15 --> Recharts["Recharts 2"]
 Next15 --> Axios["Axios 1"]
 RHF --> Zod_FE
 end

 subgraph BE["Backend Dependencies"]
 Express["Express.js 4"] --> TS2["TypeScript 5"]
 Express --> Prisma["Prisma 5"]
 Express --> Zod_BE["Zod 3"]
 Express --> JWT["jsonwebtoken 9"]
 Express --> Bcrypt["bcrypt 5"]
 Express --> Helmet["Helmet.js 7"]
 Express --> RateLimit["express-rate-limit 7"]
 Express --> Winston["Winston 3"]
 Prisma --> PG["PostgreSQL 16"]
 RateLimit --> Redis["Redis 7"]
 end

 subgraph Infra["Infrastructure"]
 Docker["Docker"] --> Nginx["Nginx"]
 Nginx --> Next15
 Nginx --> Express
 end

 style FE fill:#dbeafe
 style BE fill:#d1fae5
 style Infra fill:#fef3c7
```

---

## 2. System Architecture

### 2.1 Request Lifecycle

```mermaid
sequenceDiagram
 participant Browser as Browser
 participant Nginx as Nginx
 participant Next as ️ Next.js
 participant Express as ️ Express API
 participant PG as PostgreSQL
 participant Redis as Redis
 participant Sperto as Sperto API

 Browser->>Nginx: HTTPS Request
 Nginx->>Nginx: SSL Termination
 
 alt Frontend Request (/)
 Nginx->>Next: Forward to :3000
 Next->>Browser: HTML/JS/CSS Response
 end

 alt API Request (/api/*)
 Nginx->>Express: Forward to :4000
 Express->>Express: helmet() → cors() → rateLimit()
 Express->>Express: auth.middleware (verify JWT)
 Express->>Express: rbac.middleware (check role)
 Express->>Express: validate.middleware (Zod schema)
 Express->>Redis: Check rate limit / cache
 Redis-->>Express: OK / cached data
 
 alt Needs DB
 Express->>PG: Prisma query
 PG-->>Express: Result rows
 end
 
 alt Needs Sperto API
 Express->>Sperto: POST request
 Sperto-->>Express: JSON response
 Express->>PG: Log to ApiLogs
 end
 
 Express-->>Nginx: JSON response
 Nginx-->>Browser: JSON response
 end
```

### 2.2 Microservice-Ready Modular Architecture

```mermaid
graph LR
 subgraph Monolith_Now["Current: Modular Monolith"]
 Auth["Auth Module"]
 Users["Users Module"]
 Sessions["Sessions Module"]
 Devices["Devices Module"]
 Analytics["Analytics Module"]
 Reports["Reports Module"]
 Sperto_Mod["Sperto Module"]
 Logs["Logs Module"]
 end

 subgraph Future["Future: Microservices (v2)"]
 Auth_MS["Auth Service"]
 Sessions_MS["Session Service"]
 Analytics_MS["Analytics Service"]
 Notifications_MS["Notification Service"]
 end

 DB[("PostgreSQL")]
 Cache[("Redis")]

 Auth --> DB
 Sessions --> DB
 Sessions --> Sperto_Mod
 Devices --> DB
 Analytics --> DB
 Reports --> DB
 Logs --> DB
 Auth --> Cache
 Sessions --> Cache

 style Monolith_Now fill:#d1fae5
 style Future fill:#dbeafe
```

---

## 3. Database Design

### 3.1 Complete Prisma Schema

```mermaid
erDiagram
 USERS {
 String id PK "cuid()"
 String name "required"
 String email UK "required"
 String passwordHash "required"
 Role role "ADMIN|SALES_MANAGER"
 String avatar "optional url"
 Boolean isActive "default true"
 DateTime createdAt "now()"
 DateTime updatedAt "auto"
 }

 DEVICES {
 String id PK "cuid()"
 String deviceId UK "e.g. DEV-001"
 String deviceName "required"
 String assignedTo FK "nullable"
 DeviceStatus status "ONLINE|OFFLINE|DISABLED"
 DateTime lastSeen "nullable"
 DateTime createdAt "now()"
 }

 CUSTOMERS {
 String id PK "cuid()"
 String leadId UK "Sperto lead ID"
 String name "from Sperto API"
 DateTime createdAt "now()"
 }

 SESSIONS {
 String id PK "cuid()"
 String deviceId FK "required"
 String customerId FK "required"
 String salesManagerId FK "required"
 DateTime startTime "required"
 DateTime endTime "nullable"
 Int durationSeconds "nullable"
 SessionStatus status "ACTIVE|COMPLETED|INTERRUPTED"
 DateTime createdAt "now()"
 }

 API_LOGS {
 String id PK "cuid()"
 String endpoint "required"
 String method "GET|POST"
 Json requestBody "nullable"
 Json responseBody "nullable"
 Int statusCode "HTTP code"
 Int executionMs "milliseconds"
 Boolean isSuccess "required"
 String sessionId FK "nullable"
 DateTime createdAt "now()"
 }

 AUDIT_LOGS {
 String id PK "cuid()"
 String userId FK "required"
 String action "LOGIN|LOGOUT|SESSION_START|etc"
 Json metadata "nullable"
 String ip "client IP"
 DateTime createdAt "now()"
 }

 REFRESH_TOKENS {
 String id PK "cuid()"
 String token UK "hashed"
 String userId FK "required"
 DateTime expiresAt "7 days"
 DateTime createdAt "now()"
 }

 NOTIFICATIONS {
 String id PK "cuid()"
 String userId FK "recipient"
 String type "SESSION_START|API_FAIL|etc"
 String message "required"
 Boolean isRead "default false"
 DateTime createdAt "now()"
 }

 USERS ||--o{ SESSIONS : "conducts"
 USERS ||--o{ DEVICES : "assigned"
 USERS ||--o{ AUDIT_LOGS : "generates"
 USERS ||--o{ REFRESH_TOKENS : "holds"
 USERS ||--o{ NOTIFICATIONS : "receives"
 DEVICES ||--o{ SESSIONS : "used in"
 CUSTOMERS ||--o{ SESSIONS : "part of"
 SESSIONS ||--o{ API_LOGS : "triggers"
```

### 3.2 Database Indexes

```mermaid
graph LR
 subgraph Indexes["PostgreSQL Indexes for Performance"]
 I1["sessions.salesManagerId\n→ Fast personal history queries"]
 I2["sessions.status\n→ Fast live session queries"]
 I3["sessions.startTime\n→ Fast date range analytics"]
 I4["sessions.deviceId\n→ Fast device session history"]
 I5["api_logs.createdAt\n→ Fast log time filtering"]
 I6["api_logs.isSuccess\n→ Fast error rate queries"]
 I7["users.email\n→ Fast login lookup"]
 I8["refresh_tokens.token\n→ Fast token validation"]
 end
```

---

## 4. Authentication Architecture

### 4.1 Login Flow

```mermaid
sequenceDiagram
 participant Browser as Browser
 participant Next as ️ Next.js
 participant Express as ️ Express API
 participant DB as PostgreSQL
 participant Redis as Redis

 Browser->>Next: POST /api/auth/login\n{email, password}
 Next->>Express: Proxy → POST /auth/login
 Express->>Express: Zod validate body
 Express->>DB: SELECT user WHERE email = ?
 DB-->>Express: User row (with passwordHash)
 Express->>Express: bcrypt.compare(password, hash)
 
 alt Password Invalid
 Express-->>Browser: 401 { error: "Invalid credentials" }
 end
 
 alt Password Valid
 Express->>Express: Generate Access Token (JWT, 15min)
 Express->>Express: Generate Refresh Token (random, hashed)
 Express->>DB: INSERT refresh_token (hashed, userId, expiresAt)
 Express->>DB: INSERT audit_log (LOGIN, userId, ip)
 Express-->>Browser: 200 { accessToken, user }\n+ Set-Cookie: refreshToken (httpOnly, Secure, SameSite=Strict)
 Browser->>Browser: Store accessToken in memory (Zustand)
 Browser->>Browser: Redirect to /dashboard
 end
```

### 4.2 Token Refresh Flow

```mermaid
sequenceDiagram
 participant Browser as Browser
 participant Axios as Axios Interceptor
 participant Express as ️ Express API
 participant DB as PostgreSQL

 Browser->>Express: GET /api/sessions (with expired JWT)
 Express-->>Browser: 401 { error: "Token expired" }
 Browser->>Axios: Response interceptor catches 401
 Axios->>Express: POST /auth/refresh\n(sends httpOnly cookie automatically)
 Express->>Express: Verify refresh token signature
 Express->>DB: Find refresh token (by hash)
 
 alt Token Not Found or Expired
 Express-->>Browser: 401 → Force logout
 Browser->>Browser: Clear auth state
 Browser->>Browser: Redirect to /login
 end
 
 alt Token Valid
 Express->>Express: Generate new Access Token
 Express->>Express: Rotate Refresh Token (delete old, create new)
 Express->>DB: DELETE old refresh_token\nINSERT new refresh_token
 Express-->>Browser: 200 { accessToken }\n+ Set new refreshToken cookie
 Axios->>Axios: Retry original request with new token
 Axios-->>Browser: Original request response 
 end
```

### 4.3 Password Reset Flow

```mermaid
sequenceDiagram
 participant User as User
 participant Browser as Browser
 participant Express as ️ Express
 participant DB as DB
 participant Email as SMTP

 User->>Browser: Enter email on /forgot-password
 Browser->>Express: POST /auth/forgot-password\n{ email }
 Express->>DB: SELECT user WHERE email = ?
 
 alt User not found
 Express-->>Browser: 200 OK (security: don't reveal if email exists)
 end
 
 alt User found
 Express->>Express: Generate reset token (crypto.randomBytes)
 Express->>DB: Store hashed token + expiresAt (1 hour)
 Express->>Email: Send reset email with\n?token=RAW_TOKEN link
 Express-->>Browser: 200 { message: "If email exists, reset link sent" }
 end

 User->>Browser: Click email link → /reset-password?token=xxx
 Browser->>Browser: Show new password form
 User->>Browser: Enter new password
 Browser->>Express: POST /auth/reset-password\n{ token, newPassword }
 Express->>Express: Hash token, find in DB
 
 alt Token expired or invalid
 Express-->>Browser: 400 { error: "Invalid or expired token" }
 end
 
 alt Token valid
 Express->>Express: bcrypt.hash(newPassword, 12)
 Express->>DB: UPDATE user SET passwordHash = ?
 Express->>DB: DELETE reset token
 Express->>DB: DELETE all refresh tokens for user
 Express-->>Browser: 200 { message: "Password reset successfully" }
 Browser->>Browser: Redirect to /login
 end
```

---

## 5. API Contract

### 5.1 Standard Response Format

All API responses follow this structure:

```typescript
// Success Response
{
 "success": true,
 "data": { ... },
 "meta": { // optional, for paginated responses
 "page": 1,
 "limit": 20,
 "total": 150,
 "totalPages": 8
 }
}

// Error Response
{
 "success": false,
 "error": {
 "code": "VALIDATION_ERROR",
 "message": "Human-readable message",
 "details": [ ... ] // optional Zod errors
 }
}
```

### 5.2 Complete API Endpoint Map

```mermaid
graph TD
 subgraph Auth["/api/auth"]
 A1["POST /login"]
 A2["POST /refresh"]
 A3["POST /logout"]
 A4["POST /forgot-password"]
 A5["POST /reset-password"]
 end

 subgraph Users["/api/users\n Admin only"]
 U1["GET / — List users"]
 U2["POST / — Create user"]
 U3["GET /:id — Get user"]
 U4["PATCH /:id — Update user"]
 U5["DELETE /:id — Deactivate user"]
 U6["GET /me — Current user profile"]
 U7["PATCH /me/password — Change password"]
 end

 subgraph Devices["/api/devices\n Admin only"]
 D1["GET / — List devices"]
 D2["POST / — Register device"]
 D3["GET /:id — Get device"]
 D4["PATCH /:id — Update device"]
 D5["PATCH /:id/assign — Assign to SM"]
 D6["PATCH /:id/status — Enable/Disable"]
 end

 subgraph Sessions["/api/sessions"]
 S1["GET / — All sessions Admin"]
 S2["GET /live — Active sessions Admin"]
 S3["GET /mine — My sessions SM"]
 S4["POST /start — Start session SM"]
 S5["POST /end — End session SM"]
 S6["GET /stream — SSE stream Admin"]
 end

 subgraph Customers["/api/customers"]
 C1["GET / — All customers Admin"]
 C2["GET /:leadId — Get customer"]
 end

 subgraph Sperto["/api/sperto"]
 SP1["POST /validate-customer SM"]
 end

 subgraph Analytics["/api/analytics\n Admin"]
 AN1["GET /overview — KPI cards"]
 AN2["GET /sessions-per-day"]
 AN3["GET /sessions-per-hour"]
 AN4["GET /device-usage"]
 AN5["GET /manager-performance"]
 AN6["GET /customer-visits"]
 end

 subgraph Reports["/api/reports\n Admin"]
 R1["GET /export — Download report\n?type=daily&format=csv"]
 end

 subgraph Logs["/api/logs\n Admin"]
 L1["GET / — API log history"]
 L2["POST /:id/retry — Retry failed call"]
 end

 style Auth fill:#fef3c7
 style Sessions fill:#d1fae5
 style Sperto fill:#fee2e2
```

### 5.3 Key API Request/Response Schemas

#### POST /api/auth/login
```typescript
// Request
{ email: string; password: string }

// Response 200
{
 success: true,
 data: {
 accessToken: string,
 user: { id, name, email, role, avatar }
 }
}
```

#### POST /api/sessions/start
```typescript
// Request (Sales Manager only)
{ customerId: string; leadId: string }

// Response 200
{
 success: true,
 data: {
 sessionId: string,
 startTime: string, // ISO 8601
 customerName: string,
 deviceId: string,
 salesManagerEmail: string
 }
}
```

#### POST /api/sessions/end
```typescript
// Request
{ sessionId: string }

// Response 200
{
 success: true,
 data: {
 sessionId: string,
 startTime: string,
 endTime: string,
 durationSeconds: number,
 durationFormatted: string, // "12m 34s"
 status: "COMPLETED"
 }
}
```

#### GET /api/analytics/overview
```typescript
// Response 200
{
 success: true,
 data: {
 todaySessions: number,
 activeSessions: number,
 devicesOnline: number,
 totalDevices: number,
 totalCustomers: number,
 totalSalesManagers: number,
 avgSessionSeconds: number,
 longestSessionSeconds: number,
 shortestSessionSeconds: number
 }
}
```

---

## 6. Sperto API Integration

### 6.1 Integration Architecture

```mermaid
graph LR
 subgraph OurBackend["Our Express Backend"]
 SpertoService["sperto.service.ts\nProxy Layer"]
 RetryLogic["Retry Logic\n2 retries\nExponential backoff"]
 Logger["ApiLog Writer\nDB Logger"]
 CircuitBreaker["Circuit Breaker\n(Open after 5 failures)"]
 end

 subgraph SpertoExternal["Sperto External API"]
 ValidateCustomer["api_get_details_of_customer.php\nPOST"]
 RecordUsage["api_record_device_usage.php\nPOST"]
 end

 SpertoService --> CircuitBreaker
 CircuitBreaker --> RetryLogic
 RetryLogic --> ValidateCustomer
 RetryLogic --> RecordUsage
 SpertoService --> Logger

 style OurBackend fill:#d1fae5
 style SpertoExternal fill:#fee2e2
```

### 6.2 Validate Customer — Integration Flow

```mermaid
sequenceDiagram
 participant SM as Sales Manager
 participant FE as ️ Frontend
 participant BE as ️ Our Backend
 participant Sperto as Sperto API
 participant DB as PostgreSQL

 SM->>FE: Enter Lead ID → Click Validate
 FE->>BE: POST /api/sperto/validate-customer\n{ leadId: "CUST-123" }
 BE->>BE: Start execution timer
 BE->>Sperto: POST api_get_details_of_customer.php\n{ api_key, id: "CUST-123", type: "CUSTOMER" }
 
 alt Success
 Sperto-->>BE: { name: "John Doe", id: "CUST-123" }
 BE->>DB: UPSERT customer (leadId, name)
 BE->>DB: INSERT api_log (success, 200, execMs)
 BE-->>FE: { customerName: "John Doe", customerId: "CUST-123" }
 FE-->>SM: Show customer card 
 end
 
 alt Sperto Error (5xx or timeout)
 Sperto-->>BE: Error / Timeout
 BE->>BE: Wait 1s → Retry (attempt 2)
 BE->>Sperto: Retry request
 alt Retry fails
 BE->>DB: INSERT api_log (failure, status, execMs)
 BE-->>FE: 502 { error: "Sperto API unavailable" }
 FE-->>SM: Show error toast with retry button
 end
 end
 
 alt Customer Not Found (404)
 Sperto-->>BE: { error: "Customer not found" }
 BE->>DB: INSERT api_log (failure, 404, execMs)
 BE-->>FE: 404 { error: "Customer not found" }
 FE-->>SM: Show error: "No customer with this Lead ID"
 end
```

### 6.3 Session Start (IN) — Integration Flow

```mermaid
sequenceDiagram
 participant SM as Sales Manager
 participant FE as ️ Frontend
 participant BE as ️ Our Backend
 participant Sperto as Sperto API
 participant DB as PostgreSQL

 SM->>FE: Click "Start Presentation"
 FE->>BE: POST /api/sessions/start\n{ customerId, leadId }
 BE->>BE: Check: SM has assigned device?
 BE->>DB: SELECT device WHERE assignedTo = SM.id
 
 alt No device assigned
 BE-->>FE: 400 { error: "No device assigned to your account" }
 end
 
 alt Device found
 BE->>DB: Check no ACTIVE session for this SM
 alt Active session exists
 BE-->>FE: 409 { error: "End current session first" }
 end
 BE->>BE: Record startTime = NOW()
 BE->>Sperto: POST api_record_device_usage.php\n{ device_id, lead_id, sales_manager_email, type: "IN" }
 
 alt Sperto Success
 Sperto-->>BE: { status: "success" }
 BE->>DB: INSERT session (ACTIVE, startTime, device, customer, SM)
 BE->>DB: INSERT api_log (success)
 BE->>DB: INSERT audit_log (SESSION_START)
 BE-->>FE: 200 { sessionId, startTime }
 FE-->>SM: Start timer UI, show active banner
 end
 
 alt Sperto Failure (after 2 retries)
 Sperto-->>BE: Error
 BE->>DB: INSERT api_log (failure)
 BE-->>FE: 502 { error: "Failed to record via Sperto API" }
 Note over FE,SM: Session NOT created\nUser must retry
 end
 end
```

### 6.4 Session End (OUT) — Integration Flow

```mermaid
sequenceDiagram
 participant SM as Sales Manager
 participant FE as ️ Frontend
 participant BE as ️ Our Backend
 participant Sperto as Sperto API
 participant DB as PostgreSQL

 SM->>FE: Click "End Presentation"
 FE->>BE: POST /api/sessions/end\n{ sessionId }
 BE->>DB: SELECT session WHERE id = sessionId AND status = ACTIVE
 
 alt Session not found or not ACTIVE
 BE-->>FE: 404 { error: "No active session found" }
 end
 
 BE->>BE: Record endTime = NOW()
 BE->>BE: Calculate duration = endTime - startTime (seconds)
 BE->>Sperto: POST api_record_device_usage.php\n{ device_id, lead_id, sales_manager_email, type: "OUT" }
 
 alt Sperto Success
 Sperto-->>BE: { status: "success" }
 BE->>DB: UPDATE session\nSET endTime, duration, status=COMPLETED
 BE->>DB: INSERT api_log (success, OUT)
 BE->>DB: INSERT audit_log (SESSION_END)
 BE-->>FE: 200 { sessionId, startTime, endTime, durationSeconds, durationFormatted }
 FE-->>SM: Stop timer, show summary card 
 end
 
 alt Sperto Failure (after retries)
 Sperto-->>BE: Error
 BE->>DB: UPDATE session\nSET endTime, duration, status=COMPLETED\nSET apiSyncFailed=true
 BE->>DB: INSERT api_log (failure, OUT)
 BE-->>FE: 207 { warning: "Session saved, Sperto sync failed" }
 FE-->>SM: Show orange warning toast\nSession still saved locally
 end
```

---

## 7. Frontend Architecture

### 7.1 Next.js App Router Structure

```mermaid
graph TD
 subgraph AppRouter["Next.js App Router"]
 RootLayout["app/layout.tsx\nHTML shell, fonts, providers"]
 
 subgraph AuthGroup["(auth) Route Group\nNo sidebar layout"]
 Login["login/page.tsx"]
 Forgot["forgot-password/page.tsx"]
 Reset["reset-password/page.tsx"]
 end
 
 subgraph DashGroup["(dashboard) Route Group\nSidebar + Header layout"]
 DashLayout["layout.tsx\nSidebar · Header · Breadcrumb"]
 
 subgraph AdminRoutes["Admin Routes\nMiddleware: role=ADMIN"]
 AdminPage["page.tsx → Admin Dashboard"]
 Sessions["sessions/page.tsx"]
 LiveSessions["sessions/live/page.tsx"]
 Devices["devices/page.tsx"]
 Customers["customers/page.tsx"]
 Managers["managers/page.tsx"]
 Analytics["analytics/page.tsx"]
 Reports["reports/page.tsx"]
 Logs["logs/page.tsx"]
 Users["users/page.tsx"]
 end
 
 subgraph SMRoutes["SM Routes\nMiddleware: role=SALES_MANAGER"]
 SMPage["page.tsx → SM Dashboard"]
 Present["present/page.tsx"]
 MySessions["sessions/mine/page.tsx"]
 end
 
 subgraph SharedRoutes["Shared Routes"]
 Settings["settings/page.tsx"]
 end
 end
 end

 RootLayout --> AuthGroup
 RootLayout --> DashGroup
 DashGroup --> DashLayout
 DashLayout --> AdminRoutes
 DashLayout --> SMRoutes
 DashLayout --> SharedRoutes

 style AppRouter fill:#dbeafe
 style AuthGroup fill:#fef3c7
 style AdminRoutes fill:#d1fae5
 style SMRoutes fill:#ede9fe
```

### 7.2 Component Hierarchy

```mermaid
graph TD
 App["App Root\n(Providers: Query, Auth, Theme)"]
 
 App --> Sidebar["Sidebar\n- NavLinks\n- UserProfile\n- ThemeSwitcher"]
 App --> Header["Header\n- Breadcrumb\n- GlobalSearch\n- NotificationBell\n- UserMenu"]
 App --> PageContent["Page Content Area"]

 PageContent --> AdminDash["Admin Dashboard"]
 AdminDash --> KPIGrid["KPIGrid\n→ KPICard ×9"]
 AdminDash --> LiveTable["LiveSessionsTable\n→ auto-refresh 10s"]
 AdminDash --> ChartRow["ChartRow\n→ SessionsPerDay\n→ TopManagers"]
 AdminDash --> ActivityFeed["RecentActivity"]

 PageContent --> SMDash["SM Dashboard"]
 SMDash --> Welcome["WelcomeCard\n(name, today stats)"]
 SMDash --> PresentFlow["PresentationFlow\n→ CustomerValidator\n→ PresentationControls\n→ ActiveSessionBanner\n→ SessionTimer"]
 SMDash --> SMHistory["PersonalSessionHistory\n(last 10)"]

 PageContent --> SessionsPage["Sessions Page"]
 SessionsPage --> DataTable["DataTable (TanStack)\n→ Pagination\n→ Sorting\n→ Filters\n→ Export"]

 style App fill:#6366f1,color:#fff
 style AdminDash fill:#d1fae5
 style SMDash fill:#dbeafe
```

### 7.3 Axios Interceptor Chain

```mermaid
flowchart TD
 A([API Request]) --> B[Request Interceptor]
 B --> C[Attach Bearer token\nfrom Zustand authStore]
 C --> D[Add request ID header\nfor correlation]
 D --> E[Send Request]
 
 E --> F{Response}
 F -->|2xx| G[Response Interceptor\nReturn data.data]
 G --> H([ Caller receives data])
 
 F -->|401 Expired| I[Response Interceptor\nCatch 401]
 I --> J{Is refresh\nin progress?}
 J -->|Yes| K[Queue this request\nwait for token]
 J -->|No| L[POST /auth/refresh]
 L --> M{Refresh\nsuccess?}
 M -->|Yes| N[Update token in store]
 N --> O[Retry queued requests]
 O --> H
 M -->|No| P[Clear auth store]
 P --> Q[Redirect /login]
 
 F -->|4xx other| R[Return error to caller]
 F -->|5xx| S[Show global error toast]

 style H fill:#10b981,color:#fff
 style Q fill:#ef4444,color:#fff
```

---

## 8. State Management

### 8.1 Zustand Store Architecture

```mermaid
graph LR
 subgraph Stores["Zustand Stores (Client State)"]
 AuthStore["authStore\n─────────\nuser: User | null\naccessToken: string\nisAuthenticated: boolean\n─────────\nsetUser()\nsetToken()\nclearAuth()"]
 
 SessionStore["sessionStore\n─────────\nactiveSession: Session | null\ncustomerId: string\ncustomerName: string\nstartTime: Date | null\n─────────\nstartSession()\nendSession()\nclearSession()"]
 
 NotifStore["notificationStore\n─────────\nnotifications: Notification[]\nunreadCount: number\n─────────\naddNotification()\nmarkRead()\nclearAll()"]
 
 ThemeStore["themeStore\n─────────\ntheme: 'light' | 'dark'\n─────────\ntoggleTheme()\nsetTheme()"]
 end

 subgraph TanStack["TanStack Query (Server State)"]
 Q1["useSessionsQuery\n→ GET /api/sessions\nCache: 30s"]
 Q2["useLiveSessionsQuery\n→ GET /api/sessions/live\nCache: 10s, auto-refresh"]
 Q3["useAnalyticsQuery\n→ GET /api/analytics/*\nCache: 60s"]
 Q4["useDevicesQuery\n→ GET /api/devices\nCache: 60s"]
 Q5["startSessionMutation\n→ POST /api/sessions/start\nInvalidates: sessions, live"]
 Q6["endSessionMutation\n→ POST /api/sessions/end\nInvalidates: sessions, live"]
 end

 AuthStore --> Q1
 AuthStore --> Q2
 SessionStore --> Q5
 SessionStore --> Q6

 style Stores fill:#dbeafe
 style TanStack fill:#d1fae5
```

---

## 9. Security Architecture

### 9.1 Security Layers

```mermaid
graph TD
 subgraph SecurityLayers["Defense in Depth"]
 L1["Layer 1: Network\nNginx + TLS 1.2+\nHTTPS only"]
 L2["Layer 2: HTTP Headers\nHelmet.js\nCSP, HSTS, X-Frame-Options"]
 L3["Layer 3: Rate Limiting\nexpress-rate-limit + Redis\n100 req/15min · 5 auth/min"]
 L4["Layer 4: Authentication\nJWT (15min) + Refresh (7d)\nbcrypt passwords (12 rounds)"]
 L5["Layer 5: Authorization\nRBAC Middleware\nRole checked on every route"]
 L6["Layer 6: Input Validation\nZod schemas\nAll request bodies validated"]
 L7["Layer 7: Data Layer\nPrisma parameterized queries\nNo raw SQL = No SQL injection"]
 L8["Layer 8: Audit Trail\nAll sensitive actions logged\nIP, timestamp, user recorded"]
 end

 L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8

 style L1 fill:#dbeafe
 style L4 fill:#fef3c7
 style L7 fill:#d1fae5
 style L8 fill:#ede9fe
```

### 9.2 JWT Token Strategy

```mermaid
graph LR
 subgraph Tokens["Token Architecture"]
 AT["Access Token\n─────────────\nType: JWT\nExpiry: 15 minutes\nStorage: Zustand memory\n(never localStorage)\nContains: userId, email, role\nSecret: JWT_SECRET env var"]
 
 RT["Refresh Token\n─────────────\nType: Random bytes (hashed)\nExpiry: 7 days\nStorage: httpOnly cookie\nSameSite: Strict\nSecure: true (HTTPS only)\nStored in DB: hashed SHA-256"]
 end

 AT -->|"Expired → auto-call"| RT
 RT -->|"Issues new"| AT
 RT -->|"Rotated on use"| RT

 style AT fill:#dbeafe
 style RT fill:#d1fae5
```

---

## 10. Real-Time Communication

### 10.1 Server-Sent Events Flow

```mermaid
sequenceDiagram
 participant Admin as Admin Browser
 participant Next as ️ Next.js
 participant SSE as ️ SSE Endpoint\n/api/sessions/stream
 participant DB as PostgreSQL

 Admin->>Next: Open Live Sessions page
 Next->>SSE: GET /api/sessions/stream\n(EventSource connection)
 SSE-->>Admin: data: {"type":"connected","sessionId":"..."}\n\n
 
 loop Every 5 seconds
 SSE->>DB: SELECT active sessions
 DB-->>SSE: Active session rows
 SSE-->>Admin: data: {"type":"sessions_update","sessions":[...]}\n\n
 end
 
 Note over SSE,DB: When SM starts a session:
 SSE-->>Admin: data: {"type":"session_started","session":{...}}\n\n
 
 Note over SSE,DB: When SM ends a session:
 SSE-->>Admin: data: {"type":"session_ended","sessionId":"..."}\n\n
 
 Admin->>SSE: Connection closed (leave page)
 SSE->>SSE: Cleanup listener
```

---

## 11. Error Handling Strategy

### 11.1 Error Classification

```mermaid
graph TD
 Error([ Error Occurs]) --> Type{Error Type}

 Type -->|Validation| V["400 Bad Request\nReturn Zod field errors\nto client"]
 Type -->|Auth Failed| A["401 Unauthorized\nClear tokens\nRedirect to login"]
 Type -->|Forbidden| F["403 Forbidden\nReturn: Access denied\nLog attempt"]
 Type -->|Not Found| NF["404 Not Found\nReturn: Resource not found"]
 Type -->|Conflict| C["409 Conflict\nReturn: Duplicate or conflict\n(e.g., active session exists)"]
 Type -->|Sperto API| SP["502 Bad Gateway\nReturn: External API error\nLog to ApiLogs\nRetry if applicable"]
 Type -->|Rate Limited| RL["429 Too Many Requests\nReturn: Retry-After header"]
 Type -->|Server Error| SE["500 Internal Server Error\nLog full stack trace\nReturn: Generic error message\n(never expose internals)"]

 style Error fill:#ef4444,color:#fff
 style V fill:#f59e0b,color:#fff
 style A fill:#ef4444,color:#fff
 style SE fill:#dc2626,color:#fff
 style SP fill:#8b5cf6,color:#fff
```

### 11.2 Frontend Error Boundaries

```mermaid
graph TD
 App["App Root"] --> GlobalEB["Global Error Boundary\n(Catch all unhandled React errors)"]
 GlobalEB --> Dashboard["Dashboard Layout"]
 Dashboard --> ChartEB["Chart Error Boundary\n(Chart render failures → fallback UI)"]
 Dashboard --> TableEB["Table Error Boundary\n(Data fetch failure → empty state)"]
 Dashboard --> FormEB["Form Error Boundary\n(Form submission errors → toast)"]
 
 ChartEB -->|"Error"| ChartFallback[" Chart unavailable\nRetry button"]
 TableEB -->|"Error"| TableFallback[" Failed to load data\nRetry button"]
 GlobalEB -->|"Error"| GlobalFallback[" Something went wrong\nRefresh page button"]

 style GlobalFallback fill:#ef4444,color:#fff
 style ChartFallback fill:#f59e0b,color:#fff
 style TableFallback fill:#f59e0b,color:#fff
```

---

## 12. Performance Requirements

### 12.1 Frontend Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Lighthouse Performance Score | ≥ 85 | Lighthouse |
| JS Bundle Size (gzipped) | < 300KB | Next.js Bundle Analyzer |

### 12.2 Backend Performance Budget

| Metric | Target |
|---|---|
| Auth API response | < 200ms |
| Simple CRUD API | < 100ms |
| Analytics aggregate query | < 500ms |
| Report generation (500 rows) | < 5 seconds |
| Sperto API proxy (incl. external) | < 3 seconds |
| DB query (indexed) | < 50ms |

### 12.3 Optimization Techniques

```mermaid
mindmap
 root((Performance\nOptimizations))
 Frontend
 Next.js Image Optimization
 Dynamic imports for charts
 Skeleton loading states
 TanStack Query caching
 Zustand shallow selectors
 Memoized components
 Virtualized large tables
 Backend
 PostgreSQL indexes
 Query result caching Redis
 Pagination all list endpoints
 Streaming for large exports
 Connection pooling Prisma
 Database
 Index on session.status
 Index on session.startTime
 Index on session.salesManagerId
 Composite indexes analytics
```

---

## 13. Infrastructure & Deployment

### 13.1 Docker Compose Architecture

```mermaid
graph TB
 subgraph DockerCompose["docker-compose.yml"]
 subgraph Network["Network: sperto_net"]
 Nginx["nginx\n:80, :443\nVolume: ./nginx.conf"]
 Web["web (Next.js)\n:3000\nBuild: ./apps/web"]
 API["api (Express)\n:4000\nBuild: ./apps/api"]
 PG["postgres\n:5432\nImage: postgres:16\nVolume: pg_data"]
 Redis["redis\n:6379\nImage: redis:7-alpine\nVolume: redis_data"]
 end
 end

 Internet[" Internet"] --> Nginx
 Nginx -->|"/* "| Web
 Nginx -->|"/api/*"| API
 Web -->|"Server-side fetches"| API
 API --> PG
 API --> Redis

 style DockerCompose fill:#dbeafe
 style Nginx fill:#fef3c7
 style PG fill:#d1fae5
 style Redis fill:#fee2e2
```

### 13.2 Environment Configuration

```mermaid
graph LR
 subgraph EnvFiles[".env Files (gitignored)"]
 Dev[".env.development\nDB_URL=localhost\nNODE_ENV=development\nSPERTO_API_KEY=..."]
 Staging[".env.staging\nDB_URL=staging-db\nNODE_ENV=staging"]
 Prod[".env.production\nDB_URL=prod-db (encrypted)\nNODE_ENV=production\nJWT_SECRET=..."]
 end

 subgraph Required["Required Environment Variables"]
 V1["DATABASE_URL"]
 V2["JWT_SECRET"]
 V3["JWT_REFRESH_SECRET"]
 V4["SPERTO_API_KEY"]
 V5["SPERTO_BASE_URL"]
 V6["NEXT_PUBLIC_API_URL"]
 V7["SMTP_HOST / SMTP_PORT"]
 V8["SMTP_USER / SMTP_PASS"]
 end

 Dev --> Required
 Staging --> Required
 Prod --> Required

 style EnvFiles fill:#fef3c7
 style Required fill:#dbeafe
```

---

## 14. Logging & Monitoring

### 14.1 Log Levels & Structure

```mermaid
graph LR
 subgraph Winston["Winston Logger"]
 ERROR["ERROR\nUnhandled exceptions\nSperto API failures\nDB connection issues"]
 WARN["WARN\nRetry attempts\nRate limit hits\nSlow queries > 1s"]
 INFO["INFO\nSession start/end\nUser login/logout\nAPI calls"]
 DEBUG["DEBUG\nQuery parameters\nRequest payloads\nDev only"]
 end

 subgraph Outputs["Log Outputs"]
 Console["Console\n(colorized in dev)"]
 File["File\nlogs/app.log\n(JSON, rotated daily)"]
 ErrorFile["File\nlogs/error.log\n(errors only)"]
 end

 ERROR --> Console
 ERROR --> File
 ERROR --> ErrorFile
 WARN --> Console
 WARN --> File
 INFO --> Console
 INFO --> File
 DEBUG --> Console

 style ERROR fill:#ef4444,color:#fff
 style WARN fill:#f59e0b,color:#fff
 style INFO fill:#3b82f6,color:#fff
 style DEBUG fill:#64748b,color:#fff
```

### 14.2 Health Check Endpoint

```typescript
// GET /api/health
{
 "status": "ok",
 "timestamp": "2026-06-30T18:00:00Z",
 "services": {
 "database": "connected",
 "redis": "connected",
 "sperto": "reachable"
 },
 "version": "1.0.0",
 "uptime": 86400
}
```

---

## 15. Testing Requirements

### 15.1 Test Plan

```mermaid
graph TD
 subgraph UnitTests["Unit Tests (Jest)"]
 U1["auth.service.ts\n- hashPassword\n- comparePassword\n- generateToken\n- verifyToken"]
 U2["session.service.ts\n- calculateDuration\n- validateActiveSession\n- formatDuration"]
 U3["sperto.service.ts\n- buildRequestPayload\n- parseCustomerResponse\n- handleApiError"]
 U4["React Components\n- LoginForm renders\n- KPICard displays value\n- SessionTimer ticks\n- DataTable pagination"]
 end

 subgraph IntTests["Integration Tests (Supertest)"]
 I1["POST /auth/login\n- valid credentials\n- invalid password\n- missing fields"]
 I2["POST /sessions/start\n- success flow\n- no device assigned\n- active session exists"]
 I3["POST /sessions/end\n- success + duration\n- session not found\n- already ended"]
 I4["GET /analytics/overview\n- admin access\n- SM denied"]
 end

 subgraph E2ETests["E2E Tests (Playwright)"]
 E1["Admin Login → Dashboard\n- See KPI cards\n- See charts"]
 E2["SM Login → Present\n- Enter Lead ID\n- Validate customer\n- Start session\n- Timer running\n- End session\n- See summary"]
 E3["Admin Export\n- Navigate reports\n- Select daily\n- Download CSV"]
 E4["Auth Guard\n- SM can't visit /devices\n- Logout + session expire"]
 end

 UnitTests --> IntTests --> E2ETests

 style UnitTests fill:#d1fae5
 style IntTests fill:#dbeafe
 style E2ETests fill:#fef3c7
```

### 15.2 Coverage Requirements

| Module | Unit Coverage | Integration |
|---|---|---|
| Auth service | ≥ 90% | All endpoints |
| Session service | ≥ 85% | All endpoints |
| Sperto service | ≥ 85% | Mocked external |
| Analytics service | ≥ 70% | Key queries |
| React components | ≥ 70% | Key flows |
| **Overall** | **≥ 80%** | **All critical paths** |

---

*Document maintained by Gautam & Yogesh · Version 1.0.0 · June 30, 2026*
