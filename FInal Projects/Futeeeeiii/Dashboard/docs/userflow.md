# User Flow & Workflow Diagrams
## Sperto Dashboard & API Integration System

> **Document Version**: 1.0.0 
> **Date**: June 30, 2026 
> **Team**: Gautam · Yogesh 
> **Classification**: Internal · Confidential

---

## Table of Contents

1. [Sitemap](#1-sitemap)
2. [Information Architecture](#2-information-architecture)
3. [Authentication Flows](#3-authentication-flows)
4. [RBAC Routing Logic](#4-rbac-routing-logic)
5. [Admin Workflows](#5-admin-workflows)
6. [Sales Manager Workflows](#6-sales-manager-workflows)
7. [Notification Flow](#7-notification-flow)
8. [Data Export Flow](#8-data-export-flow)
9. [Real-Time Session Monitoring Flow](#9-real-time-session-monitoring-flow)
10. [Settings & Profile Flow](#10-settings--profile-flow)

---

## 1. Sitemap

```mermaid
graph TD
 Root[" / — Root"] --> Login["/login"]
 Root --> Forgot["/forgot-password"]
 Root --> Reset["/reset-password"]
 Root --> Dashboard["/dashboard — Main Entry"]

 Dashboard --> AdminGroup[" Admin Pages"]
 Dashboard --> SMGroup[" Sales Manager Pages"]
 Dashboard --> Shared[" Shared Pages"]

 AdminGroup --> A1["/dashboard\n(Admin Overview)"]
 AdminGroup --> A2["/sessions\n(All Sessions)"]
 AdminGroup --> A3["/sessions/live\n(Live Monitor)"]
 AdminGroup --> A4["/devices\n(Device Management)"]
 AdminGroup --> A5["/customers\n(Customer List)"]
 AdminGroup --> A6["/managers\n(Sales Manager List)"]
 AdminGroup --> A7["/analytics\n(Charts & Insights)"]
 AdminGroup --> A8["/reports\n(Report Generator)"]
 AdminGroup --> A9["/logs\n(API Log Monitor)"]
 AdminGroup --> A10["/users\n(User Management)"]

 SMGroup --> S1["/dashboard\n(SM Personal Home)"]
 SMGroup --> S2["/present\n(Presentation Flow)"]
 SMGroup --> S3["/sessions/mine\n(Personal History)"]

 Shared --> SH1["/settings\n(Profile & Preferences)"]
 Shared --> SH2["/settings/password\n(Change Password)"]

 style Root fill:#6366f1,color:#fff
 style AdminGroup fill:#d1fae5
 style SMGroup fill:#dbeafe
 style Shared fill:#fef3c7
```

---

## 2. Information Architecture

```mermaid
graph LR
 subgraph AdminNav[" Admin Navigation"]
 AN1[" Dashboard\nKPI · Live · Charts"]
 AN2[" Sessions\n→ All Sessions\n→ Live Monitor"]
 AN3[" Devices\nRegister · Assign · Status"]
 AN4[" Customers\nDirectory · History"]
 AN5[" Managers\nProfiles · Performance"]
 AN6[" Analytics\nCharts · Trends"]
 AN7[" Reports\nGenerate · Export"]
 AN8[" API Logs\nMonitor · Retry"]
 AN9["️ Users\nCreate · Manage"]
 AN10[" Notifications\nBell Dropdown"]
 AN11["️ Settings\nProfile · Theme"]
 end

 subgraph SMNav[" SM Navigation"]
 SN1[" Dashboard\nPersonal stats · Today"]
 SN2[" Present\nValidate · Start · End"]
 SN3[" My Sessions\nPersonal history"]
 SN4[" Notifications"]
 SN5["️ Settings"]
 end

 style AdminNav fill:#d1fae5
 style SMNav fill:#dbeafe
```

---

## 3. Authentication Flows

### 3.1 Login Flow

```mermaid
flowchart TD
 Start([ User visits app]) --> CheckAuth{Has valid\naccess token?}
 
 CheckAuth -->|Yes| CheckRole{User Role?}
 CheckRole -->|ADMIN| AdminDash["/dashboard\nAdmin Overview"]
 CheckRole -->|SALES_MANAGER| SMDash["/dashboard\nSM Personal Home"]
 
 CheckAuth -->|No| LoginPage["/login page"]
 LoginPage --> EnterCreds[Enter email + password]
 EnterCreds --> Validate{Frontend\nZod validation}
 
 Validate -->|Invalid| ShowErrors["Show field errors\n(red highlights)"]
 ShowErrors --> EnterCreds

 Validate -->|Valid| APICall["POST /api/auth/login\nShow loading spinner"]
 APICall --> APIResponse{API Response}
 
 APIResponse -->|401 Wrong password| WrongPass["Show: 'Invalid email or password'\nShake animation"]
 WrongPass --> EnterCreds
 
 APIResponse -->|403 Account disabled| Disabled["Show: 'Account is disabled.\nContact admin.'\nNo retry allowed"]
 
 APIResponse -->|200 Success| StoreToken["Store access token\nin Zustand authStore\n(memory only)"]
 StoreToken --> SetCookie["Refresh token set\nas httpOnly cookie\n(by server)"]
 SetCookie --> ShowToast[" Toast: 'Welcome back, {name}!'"]
 ShowToast --> CheckRole

 style Start fill:#6366f1,color:#fff
 style AdminDash fill:#10b981,color:#fff
 style SMDash fill:#10b981,color:#fff
 style Disabled fill:#ef4444,color:#fff
 style WrongPass fill:#f59e0b,color:#fff
```

### 3.2 Forgot Password Flow

```mermaid
flowchart TD
 A([Click 'Forgot Password'\non login page]) --> B["/forgot-password page"]
 B --> C[Enter email address]
 C --> D{Frontend\nvalidation}
 D -->|Invalid email| E["Show: 'Please enter a valid email'"]
 E --> C
 D -->|Valid| F["POST /api/auth/forgot-password\nShow loading"]
 F --> G["Always show:\n'If this email is registered,\nyou'll receive a reset link'\n(Security: no email enumeration)"]
 G --> H{User checks\nemail inbox}
 H -->|Email arrives| I["Click reset link in email\n(expires in 1 hour)"]
 H -->|No email| J["Click 'Resend'\n(rate limited: 1 per 5 min)"]
 J --> F
 I --> K["/reset-password?token=XXX\nShow new password form"]
 K --> L[Enter new password\n+ confirm password]
 L --> M{Passwords\nmatch & strong?}
 M -->|No| N["Show validation errors\n(length, match, strength)"]
 N --> L
 M -->|Yes| O["POST /api/auth/reset-password\n{ token, newPassword }"]
 O --> P{Token\nvalid?}
 P -->|Expired| Q["Show: 'This reset link has expired'\nButton: 'Request new link'"]
 Q --> B
 P -->|Valid| R[" Password updated!\nAll sessions revoked"]
 R --> S["Redirect to /login\nToast: 'Password reset successfully'"]

 style A fill:#6366f1,color:#fff
 style R fill:#10b981,color:#fff
 style Q fill:#ef4444,color:#fff
 style S fill:#10b981,color:#fff
```

### 3.3 Session Timeout & Auto-Refresh Flow

```mermaid
flowchart TD
 A([User makes API call]) --> B{Access token\nexpired?}
 B -->|No| C["Send request normally\n Get response"]
 B -->|Yes| D["Axios interceptor\ncatches 401 response"]
 D --> E{Refresh token\ncookie present?}
 E -->|No| F["Clear auth store\nRedirect /login\n User must re-login"]
 E -->|Yes| G["POST /api/auth/refresh\n(auto sends httpOnly cookie)"]
 G --> H{Refresh\nsuccess?}
 H -->|No - token expired/invalid| F
 H -->|Yes| I["Store new access token\nin Zustand memory"]
 I --> J["Rotate refresh token\n(new cookie set by server)"]
 J --> K["Retry original failed request\nwith new token"]
 K --> C

 style C fill:#10b981,color:#fff
 style F fill:#ef4444,color:#fff
```

### 3.4 Logout Flow

```mermaid
flowchart TD
 A([User clicks Logout]) --> B["Show confirmation:\n'Are you sure you want to logout?'"]
 B --> C{User action}
 C -->|Cancel| D[Stay on current page]
 C -->|Confirm Logout| E["POST /api/auth/logout\n(sends refresh token cookie)"]
 E --> F["Server deletes refresh token\nfrom database"]
 F --> G["Clear Zustand authStore\n(token = null, user = null)"]
 G --> H["Clear all TanStack Query cache"]
 H --> I["Cookie cleared by server\n(Set-Cookie: expires=past)"]
 I --> J["Redirect to /login"]
 J --> K["Toast: 'You have been logged out'"]

 style A fill:#ef4444,color:#fff
 style J fill:#10b981,color:#fff
```

---

## 4. RBAC Routing Logic

```mermaid
flowchart TD
 User([ User navigates to route]) --> MW["Next.js middleware.ts\nChecks route"]
 
 MW --> IsAuth{Valid JWT\nin store?}
 IsAuth -->|No| RedirectLogin["/login?redirect=originalUrl"]
 
 IsAuth -->|Yes| RouteType{Route type?}
 
 RouteType -->|Public /login, /forgot| RedirectDash["Redirect to /dashboard\n(already logged in)"]
 
 RouteType -->|Admin-only route| CheckAdmin{role === 'ADMIN'?}
 CheckAdmin -->|No| Forbidden["403 Forbidden page\n'You don't have access\nto this page'"]
 CheckAdmin -->|Yes| AdminPage[" Render admin page"]
 
 RouteType -->|SM-only route| CheckSM{role === 'SALES_MANAGER'?}
 CheckSM -->|No| Forbidden
 CheckSM -->|Yes| SMPage[" Render SM page"]
 
 RouteType -->|Shared route /settings| SharedPage[" Render shared page\n(role-filtered content)"]

 style RedirectLogin fill:#f59e0b,color:#fff
 style Forbidden fill:#ef4444,color:#fff
 style AdminPage fill:#10b981,color:#fff
 style SMPage fill:#10b981,color:#fff
```

---

## 5. Admin Workflows

### 5.1 Admin Dashboard Overview Flow

```mermaid
flowchart TD
 A([Admin logs in]) --> B["Load /dashboard\nAdmin Overview"]
 B --> C["Parallel data fetches\n(TanStack Query)"]
 
 C --> D1["GET /api/analytics/overview\n→ KPI Cards"]
 C --> D2["GET /api/sessions/live\n→ Live Sessions Table"]
 C --> D3["GET /api/analytics/sessions-per-day\n→ Area Chart"]

 D1 --> E1{Data loaded?}
 D1 -->|Loading| SK1["Show skeleton cards\n(pulse animation)"]
 E1 -->|Yes| F1["Render 9 KPI cards\nwith values + trends"]
 E1 -->|Error| G1["Show empty state\n'Failed to load KPIs'\nRetry button"]

 D2 --> E2{Data loaded?}
 D2 -->|Loading| SK2["Show table skeleton\n(5 ghost rows)"]
 E2 -->|Yes| F2["Render live sessions table\n(auto-refresh 10s)"]
 E2 -->|No active sessions| G2["Show: 'No active sessions'\nempty state"]

 D3 --> E3{Data loaded?}
 E3 -->|Yes| F3["Render Sessions Per Day\nArea Chart (30 days)"]

 style A fill:#6366f1,color:#fff
 style F1 fill:#10b981,color:#fff
 style F2 fill:#10b981,color:#fff
 style F3 fill:#10b981,color:#fff
```

### 5.2 Device Registration Flow

```mermaid
flowchart TD
 A([Admin on /devices page]) --> B["See device list table\nwith status badges"]
 B --> C["Click '+ Register Device'\nbutton (top right)"]
 C --> D["Open slide-over panel / modal:\nDevice ID input\nDevice Name input"]
 D --> E[Fill in device details]
 E --> F{Zod validation}
 F -->|Invalid| G["Show field errors\nin red"]
 G --> E
 F -->|Valid| H["POST /api/devices\n{ deviceId, deviceName }"]
 H --> I{API response}
 I -->|409 Device ID exists| J["Show: 'Device ID already registered'"]
 J --> E
 I -->|200 Success| K[" Toast: 'Device registered'\nClose modal"]
 K --> L["TanStack Query invalidates\n/api/devices cache"]
 L --> M["Device table refreshes\nNew device appears at top"]
 M --> N{Admin wants\nto assign?}
 N -->|Yes| O["Click 'Assign' on device row\nSee: Assign Device Flow"]
 N -->|No| B

 style A fill:#6366f1,color:#fff
 style K fill:#10b981,color:#fff
 style J fill:#ef4444,color:#fff
```

### 5.3 Assign Device to Sales Manager Flow

```mermaid
flowchart TD
 A([Admin clicks 'Assign'\non device row]) --> B["Open Assign Device modal:\nDevice: DEV-001 (fixed)\nAssign to: dropdown of Sales Managers"]
 B --> C["Load Sales Managers dropdown\nGET /api/users?role=SALES_MANAGER"]
 C --> D{SMs loaded?}
 D -->|Loading| E["Show dropdown loading..."]
 D -->|Yes| F["Display SM list with\ncurrent assignment shown"]
 F --> G["Admin selects a Sales Manager"]
 G --> H{SM already\nhas a device?}
 H -->|Yes| I["Show warning:\n'This manager is assigned\nto DEV-002. Reassign?'"]
 I --> J{Admin confirms?}
 J -->|No| G
 J -->|Yes| K["PATCH /api/devices/:id/assign\n{ userId }"]
 H -->|No| K
 K --> L{API response}
 L -->|Success| M[" Toast: 'Device assigned to {SM Name}'"]
 M --> N["Device table updates\nShows new assigned user"]
 L -->|Error| O["Show error toast"]

 style A fill:#6366f1,color:#fff
 style M fill:#10b981,color:#fff
 style O fill:#ef4444,color:#fff
```

### 5.4 Live Sessions Monitor Flow

```mermaid
flowchart TD
 A([Admin opens /sessions/live]) --> B["Connect to SSE stream\nGET /api/sessions/stream"]
 B --> C{Connection\nestablished?}
 C -->|No| D["Show: 'Connecting to live feed...'\nSpinner"]
 D --> E{Retry after\n3 seconds}
 E --> C
 C -->|Yes| F["Show: 🟢 'Live'\ngreen indicator"]
 F --> G["Load initial active sessions\nfrom SSE first message"]
 G --> H{Active sessions?}
 H -->|None| I["Show empty state:\n'No active sessions\nAll sales managers are offline'"]
 H -->|Yes| J["Render live table:\nDevice · Customer · SM\nTimer · Status · Actions"]
 J --> K["Each row shows\nrunning timer (client-side)"]
 
 K --> L{SSE Event received}
 L -->|session_started| M["Animate new row\nsliding in (green flash)"]
 M --> J
 L -->|session_ended| N["Animate row\nfading out (gray)"]
 N --> J
 L -->|connection lost| O["Show: 'Disconnected'\nAuto-retry every 5s"]
 O --> B

 style A fill:#6366f1,color:#fff
 style F fill:#10b981,color:#fff
 style I fill:#64748b,color:#fff
 style O fill:#ef4444,color:#fff
```

### 5.5 Session History & Filters Flow

```mermaid
flowchart TD
 A([Admin opens /sessions]) --> B["Load session table\nGET /api/sessions?page=1&limit=20"]
 B --> C["Render DataTable with:\nAll columns · Pagination · Sort"]
 
 C --> D{User action}
 
 D -->|Search| E["Type in global search box\nDebounced 300ms\nFilters by SM name, Customer, ID"]
 E --> F["GET /api/sessions?search=query\nRefetch with search param"]
 F --> C
 
 D -->|Filter by date| G["Open date range picker\nSelect: Today / 7 days / Custom"]
 G --> H["GET /api/sessions?from=&to=\nRefetch with date params"]
 H --> C
 
 D -->|Filter by device| I["Select device from dropdown"]
 I --> J["GET /api/sessions?deviceId=\nRefetch"]
 J --> C
 
 D -->|Filter by status| K["Select: Active / Completed / Interrupted"]
 K --> L["GET /api/sessions?status=\nRefetch"]
 L --> C
 
 D -->|Sort column| M["Click column header\nToggle asc/desc\nServer-side sort"]
 M --> N["GET /api/sessions?sort=startTime&order=desc\nRefetch"]
 N --> C
 
 D -->|Change page| O["Click pagination controls\nNext / Prev / Page number"]
 O --> P["GET /api/sessions?page=2\nRefetch"]
 P --> C
 
 D -->|Export| Q["Click Export button\nSee: Data Export Flow"]

 style A fill:#6366f1,color:#fff
 style C fill:#dbeafe
```

### 5.6 User Management Flow (Admin)

```mermaid
flowchart TD
 A([Admin on /users]) --> B["See users table:\nName · Email · Role · Status · Actions"]
 
 B --> Action{Admin action}
 
 Action -->|Create User| C["Click '+ Add User' button"]
 C --> D["Modal: Name · Email · Role · Temp Password"]
 D --> E{Validation}
 E -->|Invalid| F["Show field errors"]
 F --> D
 E -->|Valid| G["POST /api/users\n{ name, email, role, password }"]
 G --> H{Response}
 H -->|Email exists| I["Show: 'Email already in use'"]
 I --> D
 H -->|Success| J[" 'User created'\nTable refreshes"]
 
 Action -->|Edit User| K["Click ️ Edit on row"]
 K --> L["Pre-filled modal\nUpdate name, role"]
 L --> M["PATCH /api/users/:id"]
 M --> N[" 'User updated'"]
 
 Action -->|Disable User| O["Click Disable"]
 O --> P["Confirm dialog:\n'This will prevent user from\nlogging in. Proceed?'"]
 P --> Q{Confirmed?}
 Q -->|No| B
 Q -->|Yes| R["PATCH /api/users/:id\n{ isActive: false }"]
 R --> S["All user sessions revoked\nRefresh tokens deleted"]
 S --> T[" 'User disabled'"]
 
 J & N & T --> B

 style A fill:#6366f1,color:#fff
 style J fill:#10b981,color:#fff
 style N fill:#10b981,color:#fff
 style T fill:#10b981,color:#fff
```

### 5.7 Analytics Dashboard Flow

```mermaid
flowchart TD
 A([Admin opens /analytics]) --> B["Load Analytics page\nDefault: Last 30 days"]
 B --> C["Parallel fetch all chart data"]
 
 C --> C1["Sessions Per Day\nGET /api/analytics/sessions-per-day"]
 C --> C2["Sessions Per Hour\nGET /api/analytics/sessions-per-hour"]
 C --> C3["Device Usage\nGET /api/analytics/device-usage"]
 C --> C4["Manager Performance\nGET /api/analytics/manager-performance"]
 C --> C5["Customer Visits\nGET /api/analytics/customer-visits"]
 
 C1 & C2 & C3 & C4 & C5 --> D["All charts render\nwith Recharts"]
 
 D --> E{Admin changes\ndate range?}
 E -->|Select 'Last 7 Days'| F["Update query params\nRefetch all charts"]
 E -->|Select 'This Month'| F
 E -->|Custom date picker| G["Open date picker\nSelect from-to dates"]
 G --> F
 F --> D
 
 D --> H{Admin hovers\non chart?}
 H -->|Yes| I["Show Recharts tooltip\nValue · Date · Trend"]
 
 D --> J{Admin clicks\ndata point?}
 J -->|Yes| K["Drill-down: filter sessions\nby that date/device/manager"]

 style A fill:#6366f1,color:#fff
 style D fill:#10b981,color:#fff
```

### 5.8 API Logs Monitor Flow

```mermaid
flowchart TD
 A([Admin opens /logs]) --> B["Load API logs table\nGET /api/logs?page=1\nMost recent first"]
 B --> C["Render log table:\nEndpoint · Status · Time · Timestamp"]
 
 C --> D{Admin action}
 
 D -->|View log detail| E["Click row to expand\nShow: Request payload\nResponse payload\nExecution time\nTimestamp"]
 
 D -->|Filter by success| F["Click 'Success / Failed' toggle"]
 F --> G["GET /api/logs?success=false\nShow only failed calls"]
 G --> C
 
 D -->|Search endpoint| H["Type endpoint in search\nFilter: /api_record_device_usage"]
 H --> C
 
 D -->|Retry failed call| I{Is call\nretriable?}
 I -->|No (read-only)| J["Retry button disabled\n(grey, tooltip: 'Read-only calls\ncannot be retried')"]
 I -->|Yes (state-change)| K["Click ' Retry' button"]
 K --> L["Show: 'Are you sure you want\nto retry this API call?'\nConfirm dialog"]
 L --> M{Confirmed?}
 M -->|No| C
 M -->|Yes| N["POST /api/logs/:id/retry"]
 N --> O{Retry result}
 O -->|Success| P[" 'Retry successful'\nNew log entry created\nOld marked: 'Retried'"]
 O -->|Failure| Q[" 'Retry failed again'\nNew error log entry"]
 P & Q --> C

 style A fill:#6366f1,color:#fff
 style P fill:#10b981,color:#fff
 style Q fill:#ef4444,color:#fff
```

---

## 6. Sales Manager Workflows

### 6.1 SM Dashboard Home Flow

```mermaid
flowchart TD
 A([SM logs in]) --> B["Load /dashboard\nSM Personal Home"]
 B --> C["Parallel data fetches"]
 C --> D1["GET /api/sessions/mine?today=true\n→ Today's session count"]
 C --> D2["GET /api/sessions/mine?status=ACTIVE\n→ Any active session?"]
 C --> D3["GET /api/users/me\n→ Profile + device info"]
 
 D2 --> E{Active session\nexists?}
 E -->|Yes| F["Show ACTIVE SESSION BANNER\n🟢 'Presentation in Progress'\nCustomer name · Timer running\nEnd Presentation button"]
 E -->|No| G["Show Presentation Panel\n'Start a new session'\nCustomer validator input"]
 
 D1 --> H["Show Welcome Card:\n'Good morning, {name}!'\nToday: X sessions · X minutes total"]
 D3 --> I["Show assigned device chip:\n'Your device: DEV-001'"]
 
 F & G & H & I --> J["Show Recent Sessions\n(last 5, paginated link)"]

 style A fill:#6366f1,color:#fff
 style F fill:#10b981,color:#fff
```

### 6.2 Complete Sales Manager Session Workflow

```mermaid
flowchart TD
 A([SM on /present page]) --> B{Existing active\nsession?}
 
 B -->|Yes| ACTIVE["Show active session UI:\n🟢 Session in progress\nCustomer: {name}\nTimer: 00:12:34\nEnd Presentation button"]
 
 B -->|No| STEP1["STEP 1: Enter Lead ID\nInput field with placeholder\n'Enter Customer Lead ID'"]
 
 STEP1 --> STEP2["STEP 2: Click 'Validate Customer'"]
 STEP2 --> VAL{Valid Lead ID?}
 VAL -->|Empty/invalid format| ERR1["Show: 'Please enter a valid Lead ID'\n(field goes red)"]
 ERR1 --> STEP1
 VAL -->|Valid format| APICALL1["POST /api/sperto/validate-customer\n{ leadId }\nShow spinner on button"]
 
 APICALL1 --> VALRES{Sperto API\nResponse}
 VALRES -->|Customer found| STEP3["STEP 3: Show Customer Card\n──────────────────\n John Doe\nLead ID: CUST-123\n──────────────────\nConfirm button appears"]
 VALRES -->|Not found| ERR2[" 'No customer found with\nthis Lead ID'\nClear form, retry"]
 VALRES -->|API error| ERR3["🟡 'Unable to verify customer.\nCheck connection and retry.'"]
 
 ERR2 --> STEP1
 ERR3 --> STEP1
 
 STEP3 --> STEP4["STEP 4: Click 'Start Presentation'\n(now enabled, green button)"]
 STEP4 --> CONFIRM["Confirmation modal:\n'Start session with John Doe?\nDevice: DEV-001'\nConfirm · Cancel"]
 CONFIRM --> CONFRES{SM confirms?}
 CONFRES -->|Cancel| STEP3
 CONFRES -->|Confirm| APICALL2["POST /api/sessions/start\n{ customerId, leadId }\nShow spinner"]
 
 APICALL2 --> STARTRES{Session start\nresult}
 STARTRES -->|Success| STEP5["STEP 5: SESSION ACTIVE\n────────────────────────\n🟢 Presentation in Progress\nCustomer: John Doe\nStarted: 2:30 PM\nTimer: 00:00:01 → (counting)\n────────────────────────\nEnd Presentation button\n(red, prominent)"]
 STARTRES -->|No device assigned| ERR4[" 'No device assigned to\nyour account.\nContact admin.'"]
 STARTRES -->|API error| ERR5[" 'Failed to start session.\nSperto API error. Try again.'"]
 
 STEP5 --> ACTIVE
 ACTIVE --> STEP6["STEP 6: SM presents\nPDF / Brochure / Catalog\n(external software, we just track time)"]
 
 STEP6 --> STEP7["STEP 7: Click 'End Presentation'\n(SM is done with customer)"]
 STEP7 --> ENDCONFIRM["End Presentation modal:\n'Session Summary So Far:\nCustomer: John Doe\nDuration: 00:23:45'\nEnd Now · Continue"]
 ENDCONFIRM --> ENDRES{SM decides}
 ENDRES -->|Continue| STEP6
 ENDRES -->|End Now| APICALL3["POST /api/sessions/end\n{ sessionId }\nShow spinner"]
 
 APICALL3 --> ENDAPIRES{End session\nresult}
 ENDAPIRES -->|Success| STEP8["STEP 8: Session Summary Card\n────────────────────────\n Presentation Complete\nCustomer: John Doe\nStarted: 2:30 PM\nEnded: 2:54 PM\nDuration: 23 minutes 45 seconds\n────────────────────────\nStart New Session button"]
 ENDAPIRES -->|Sperto failed but saved| WARN["🟡 Warning: Session saved\nbut Sperto sync failed.\nAdmin has been notified."]
 WARN --> STEP8
 STEP8 --> B

 style A fill:#6366f1,color:#fff
 style STEP5 fill:#10b981,color:#fff
 style STEP8 fill:#10b981,color:#fff
 style ERR1 fill:#ef4444,color:#fff
 style ERR2 fill:#ef4444,color:#fff
 style ERR3 fill:#f59e0b,color:#fff
 style ERR4 fill:#ef4444,color:#fff
 style ERR5 fill:#ef4444,color:#fff
 style WARN fill:#f59e0b,color:#fff
```

### 6.3 SM Session History Flow

```mermaid
flowchart TD
 A([SM on /sessions/mine]) --> B["Load personal session history\nGET /api/sessions/mine?page=1"]
 B --> C["Render table:\nDate · Customer · Duration · Status"]
 
 C --> D{SM action}
 D -->|Filter Today| E["GET /api/sessions/mine?today=true"]
 D -->|Filter This Week| F["GET /api/sessions/mine?week=true"]
 D -->|Custom Date| G["Date picker\nSelect range"]
 G --> H["GET /api/sessions/mine?from=&to="]
 D -->|Click session row| I["Expand row or modal:\nSession details\nStart time · End time\nDuration · Customer name\nDevice ID"]
 
 E & F & H --> C

 style A fill:#6366f1,color:#fff
 style I fill:#dbeafe
```

### 6.4 SM Personal Analytics Flow

```mermaid
flowchart TD
 A([SM on /dashboard - analytics section]) --> B["Load personal stats"]
 B --> C1["Today's sessions: X"]
 B --> C2["This week: X sessions"]
 B --> C3["This month: X sessions"]
 B --> C4["Average duration: X min"]
 B --> C5["Personal chart:\nSessions per day (7 days)"]
 
 C1 & C2 & C3 & C4 & C5 --> D["Render personal\nperformance section"]
 D --> E{SM wants\nmore detail?}
 E -->|Yes| F["Click 'View My Sessions'\nNavigate to /sessions/mine"]
 E -->|No| G["Stay on dashboard\nSee today's session list"]

 style A fill:#6366f1,color:#fff
```

---

## 7. Notification Flow

### 7.1 Notification Generation & Display Flow

```mermaid
flowchart TD
 subgraph Events["Trigger Events"]
 E1["Session Started\n(SM starts presentation)"]
 E2["Session Ended\n(SM ends presentation)"]
 E3["Login Success"]
 E4["API Failure\n(Sperto error)"]
 E5["Session Timeout\n(JWT expired)"]
 E6["Device Status Change\n(Admin registered/assigned)"]
 end

 subgraph Backend["Backend Processing"]
 B1["Create notification\nin DB for recipient user(s)"]
 B2["Push via SSE\nto connected clients"]
 end

 subgraph Frontend["Frontend Display"]
 F1["Sonner Toast\n(bottom right)\nAuto-dismiss 5s"]
 F2["Bell icon count\n+1 unread badge"]
 F3["Notification panel\n(click bell to open)"]
 F4["Notification item\nin panel list"]
 end

 E1 --> B1
 E2 --> B1
 E3 --> B1
 E4 --> B1
 E5 --> B1
 E6 --> B1
 
 B1 --> B2
 B2 --> F1
 B2 --> F2
 F2 --> F3
 F3 --> F4

 style E1 fill:#10b981,color:#fff
 style E2 fill:#10b981,color:#fff
 style E4 fill:#ef4444,color:#fff
 style E5 fill:#f59e0b,color:#fff
```

### 7.2 Notification Panel Interaction Flow

```mermaid
flowchart TD
 A([User sees with badge]) --> B["Click bell icon"]
 B --> C["Slide-in notification panel\nLoad GET /api/notifications\nShow unread at top"]
 C --> D{Notifications?}
 D -->|Empty| E["Show: 'No notifications yet'\nEmpty state illustration"]
 D -->|Has notifications| F["List notifications:\n• 🟢 Session started: John Doe\n• Session ended: 23 min\n• API error: Sperto timeout"]
 F --> G{User clicks\nnotification}
 G -->|Session notification| H["Mark as read\nNavigate to /sessions/live\nor /sessions/mine"]
 G -->|API error notification| I["Mark as read\nNavigate to /logs"]
 G -->|'Mark all read' button| J["PATCH /api/notifications/mark-all-read\nAll badges cleared"]
 H & I & J --> K["Bell badge\ncount updates"]

 style A fill:#6366f1,color:#fff
 style H fill:#10b981,color:#fff
 style I fill:#10b981,color:#fff
```

---

## 8. Data Export Flow

```mermaid
flowchart TD
 A([Admin on /reports page]) --> B["Select report type:\n• Daily Report\n• Weekly Report\n• Monthly Report\n• Device Report\n• Customer Report\n• Sales Manager Report\n• Session Report"]
 B --> C["Select date range\n(pre-filled based on type)"]
 C --> D["Select export format:\n CSV\n Excel (.xlsx)\n PDF"]
 D --> E["Click 'Generate Report'\nShow: 'Preparing report...' spinner"]
 E --> F["GET /api/reports/export\n?type=daily&format=csv&from=&to=\nAuthorization: Bearer token"]
 F --> G{Report size}
 G -->|Small < 500 rows| H["Stream file directly\nContent-Disposition: attachment\nContent-Type: text/csv"]
 G -->|Large > 500 rows| I["Show progress bar\n'Processing 1200 rows...'"]
 I --> H
 H --> J["Browser auto-downloads file\nsperto-daily-2026-06-30.csv"]
 J --> K[" Toast: 'Report downloaded!\n1,234 sessions exported'"]
 
 F --> ERR{Error?}
 ERR -->|No data for range| L["Show: 'No sessions found\nfor selected date range'"]
 ERR -->|Server error| M["Show: ' Export failed.\nPlease try again.'"]

 style A fill:#6366f1,color:#fff
 style K fill:#10b981,color:#fff
 style L fill:#f59e0b,color:#fff
 style M fill:#ef4444,color:#fff
```

---

## 9. Real-Time Session Monitoring Flow

```mermaid
sequenceDiagram
 participant Admin as Admin Browser
 participant SSE as SSE Endpoint
 participant SM1 as Sales Manager 1
 participant SM2 as Sales Manager 2
 participant BE as ️ Backend

 Admin->>SSE: Open /sessions/live page\nConnect EventSource
 SSE-->>Admin: {"type":"connected"}\nInitial sessions snapshot

 Note over Admin,SSE: Admin sees empty live table

 SM1->>BE: POST /sessions/start\n{customer: "Alice", device: "DEV-001"}
 BE-->>SM1: 200 { sessionId }
 BE->>SSE: Emit: session_started event
 SSE-->>Admin: {"type":"session_started",\n"session":{id, customer:"Alice",\nSM:"SM1", device:"DEV-001",\nstartTime, status:"ACTIVE"}}
 
 Note over Admin: New row animates in 🟢
 Note over Admin: Client-side timer starts: 00:00:01...

 SM2->>BE: POST /sessions/start\n{customer: "Bob", device: "DEV-002"}
 BE-->>SM2: 200 { sessionId }
 BE->>SSE: Emit: session_started event
 SSE-->>Admin: {"type":"session_started",\n"session":{...Bob...}}
 Note over Admin: Second row animates in 🟢

 Note over Admin,SSE: Admin now sees 2 active sessions, timers running

 SM1->>BE: POST /sessions/end\n{sessionId}
 BE-->>SM1: 200 { duration: 845 }
 BE->>SSE: Emit: session_ended event
 SSE-->>Admin: {"type":"session_ended",\n"sessionId":"...", "duration":845,\n"status":"COMPLETED"}
 Note over Admin: Alice row fades out \nTimer stops, shows "14m 05s"
```

---

## 10. Settings & Profile Flow

### 10.1 Profile Update Flow

```mermaid
flowchart TD
 A([User on /settings]) --> B["Show profile form:\nName · Email (read-only)\nAvatar upload\nRole (read-only)"]
 B --> C["User edits name / avatar"]
 C --> D{Changed?}
 D -->|No changes| E["Save button disabled\n(grey)"]
 D -->|Changed| F["Save button enabled\n(blue)"]
 F --> G["Click Save"]
 G --> H{Validation}
 H -->|Invalid| I["Show field errors"]
 I --> C
 H -->|Valid| J["PATCH /api/users/me\n{ name, avatar }"]
 J --> K{Response}
 K -->|Success| L[" 'Profile updated'\nUpdate Zustand authStore\nUpdate header avatar"]
 K -->|Error| M[" 'Failed to save. Try again.'"]

 style A fill:#6366f1,color:#fff
 style L fill:#10b981,color:#fff
 style M fill:#ef4444,color:#fff
```

### 10.2 Change Password Flow

```mermaid
flowchart TD
 A([User on /settings/password]) --> B["Show form:\nCurrent Password\nNew Password\nConfirm New Password"]
 B --> C["User fills form"]
 C --> D{Frontend\nvalidation}
 D -->|New passwords don't match| E["Show: 'Passwords do not match'"]
 E --> C
 D -->|New password too weak| F["Show strength meter\n'Password must be 8+ chars\nwith uppercase + number'"]
 F --> C
 D -->|Valid| G["PATCH /api/users/me/password\n{ currentPassword, newPassword }"]
 G --> H{Response}
 H -->|401 Wrong current password| I["Show: 'Current password\nis incorrect'"]
 I --> C
 H -->|200 Success| J[" 'Password changed'\nAll other sessions logged out\n(refresh tokens revoked)"]
 J --> K["Redirect to /login\n'Please log in with\nyour new password'"]

 style A fill:#6366f1,color:#fff
 style J fill:#10b981,color:#fff
 style K fill:#6366f1,color:#fff
```

### 10.3 Theme Switcher Flow

```mermaid
flowchart LR
 A([User clicks Theme Toggle\nin sidebar/header]) --> B{Current theme?}
 B -->|Light| C["Switch to Dark Mode\nUpdate Zustand themeStore\nAdd 'dark' class to html element\nSave to localStorage"]
 B -->|Dark| D["Switch to Light Mode\nUpdate Zustand themeStore\nRemove 'dark' class\nSave to localStorage"]
 C & D --> E["Tailwind dark: variants\napply instantly\nSmooth CSS transition 300ms"]
 E --> F["Theme persists\nacross page refreshes\n(read from localStorage on app init)"]

 style A fill:#6366f1,color:#fff
 style F fill:#10b981,color:#fff
```

---

## Summary: All Workflows at a Glance

| # | Workflow | Actor | Key API Calls | Complexity |
|---|---|---|---|---|
| 1 | Login | All | POST /auth/login | Medium |
| 2 | Forgot Password | All | POST /auth/forgot-password | Medium |
| 3 | Reset Password | All | POST /auth/reset-password | Medium |
| 4 | Token Auto-Refresh | System | POST /auth/refresh | High |
| 5 | Logout | All | POST /auth/logout | Low |
| 6 | RBAC Route Guard | System | Middleware | High |
| 7 | Admin Dashboard Load | Admin | GET /analytics/overview | Medium |
| 8 | Register Device | Admin | POST /devices | Low |
| 9 | Assign Device | Admin | PATCH /devices/:id/assign | Medium |
| 10 | Live Session Monitor | Admin | SSE /sessions/stream | High |
| 11 | Session History + Filters | Admin | GET /sessions | Medium |
| 12 | User Management | Admin | POST/PATCH /users | Medium |
| 13 | Analytics Dashboard | Admin | GET /analytics/* | Medium |
| 14 | API Logs + Retry | Admin | GET /logs · POST /logs/:id/retry | Medium |
| 15 | Customer Validation | Sales Manager | POST /sperto/validate-customer | High |
| 16 | Start Presentation | Sales Manager | POST /sessions/start → Sperto IN | High |
| 17 | End Presentation | Sales Manager | POST /sessions/end → Sperto OUT | High |
| 18 | SM Session History | Sales Manager | GET /sessions/mine | Low |
| 19 | Data Export | Admin | GET /reports/export | Medium |
| 20 | Notifications | All | SSE + /notifications | High |
| 21 | Change Password | All | PATCH /users/me/password | Medium |
| 22 | Profile Update | All | PATCH /users/me | Low |
| 23 | Theme Switch | All | localStorage | Low |

---

*Document maintained by Gautam & Yogesh · Version 1.0.0 · June 30, 2026*
