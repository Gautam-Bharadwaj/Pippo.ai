# SDLC Document — Sperto Dashboard & API Integration System

> **Document Version**: 1.0.0 
> **Date**: June 30, 2026 
> **Project**: Sperto Sales Presentation Tracking Dashboard 
> **Team**: Gautam (Frontend Lead) · Yogesh (Backend Lead) 
> **Classification**: Internal · Confidential

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [SDLC Model Selection](#2-sdlc-model-selection)
3. [Phase 1 — Planning](#3-phase-1--planning)
4. [Phase 2 — Requirements Analysis](#4-phase-2--requirements-analysis)
5. [Phase 3 — System Design](#5-phase-3--system-design)
6. [Phase 4 — Architecture Design](#6-phase-4--architecture-design)
7. [Phase 5 — Implementation](#7-phase-5--implementation)
8. [Phase 6 — Testing & QA](#8-phase-6--testing--qa)
9. [Phase 7 — Deployment](#9-phase-7--deployment)
10. [Phase 8 — Maintenance](#10-phase-8--maintenance)
11. [Risk Register](#11-risk-register)
12. [Team & Responsibilities](#12-team--responsibilities)

---

## 1. Project Overview

The Sperto Dashboard is an **enterprise SaaS application** that enables Sales Managers to track customer presentation sessions in real time, while giving Admins complete visibility into device usage, customer interactions, and performance analytics. The system integrates with the Sperto external API to record session start/end events.

### Project Goals

| Goal | Success Metric |
|---|---|
| Real-time session tracking | < 1s latency on session start/end |
| Sperto API integration | 100% of sessions logged via API |
| Role-based access | Zero unauthorized page access in testing |
| Analytics dashboard | All 8 chart types rendered correctly |
| Production deployment | Zero-downtime Docker deployment |

---

## 2. SDLC Model Selection

**Selected Model**: Agile Scrum with CI/CD

**Justification**:
- Small team (2 engineers) benefits from rapid iteration
- Sperto API integration needs prototyping and validation early
- UI/UX requirements benefit from iterative feedback
- 4-week timeline suits 2-week sprint cadence

```mermaid
graph LR
 A[ Planning] --> B[ Requirements]
 B --> C[ System Design]
 C --> D[️ Architecture]
 D --> E[ Implementation]
 E --> F[ Testing]
 F --> G[ Deployment]
 G --> H[ Maintenance]
 H -->|New Sprint| B

 style A fill:#6366f1,color:#fff
 style B fill:#8b5cf6,color:#fff
 style C fill:#06b6d4,color:#fff
 style D fill:#10b981,color:#fff
 style E fill:#f59e0b,color:#fff
 style F fill:#ef4444,color:#fff
 style G fill:#3b82f6,color:#fff
 style H fill:#64748b,color:#fff
```

---

## 3. Phase 1 — Planning

### 3.1 Project Timeline (Gantt)

```mermaid
gantt
 title Sperto Dashboard — Project Timeline
 dateFormat YYYY-MM-DD
 section Phase 1 · Planning
 Kickoff & Scope Definition :done, p1a, 2026-07-01, 1d
 Tech Stack Finalization :done, p1b, 2026-07-01, 1d
 Environment Setup :done, p1c, 2026-07-02, 1d

 section Phase 2 · Requirements
 PRD Writing :active, p2a, 2026-07-02, 2d
 TRD Writing :p2b, 2026-07-03, 2d
 User Flow Diagrams :p2c, 2026-07-03, 2d

 section Phase 3 · Design
 Database Schema Design :p3a, 2026-07-05, 2d
 API Contract Design :p3b, 2026-07-05, 2d
 UI Wireframes :p3c, 2026-07-06, 2d

 section Phase 4 · Sprint 1 (Backend Core)
 Monorepo + Project Setup :p4a, 2026-07-07, 1d
 Prisma Schema + Migrations :p4b, 2026-07-07, 2d
 Auth API (Login/Refresh/Reset) :p4c, 2026-07-08, 3d
 Users + Devices + Sessions API :p4d, 2026-07-10, 4d

 section Phase 5 · Sprint 1 (Frontend Core)
 Design System + Tailwind Setup :p5a, 2026-07-07, 2d
 Layout (Sidebar + Header) :p5b, 2026-07-08, 2d
 Auth Pages (Login/Forgot/Reset) :p5c, 2026-07-09, 2d
 Admin Dashboard + KPI Cards :p5d, 2026-07-10, 3d

 section Phase 6 · Sprint 2 (Features)
 Sperto API Integration :p6a, 2026-07-14, 3d
 SM Presentation Workflow :p6b, 2026-07-14, 3d
 Analytics Charts :p6c, 2026-07-16, 3d
 Reports + Export :p6d, 2026-07-17, 3d
 API Logs Page :p6e, 2026-07-19, 2d

 section Phase 7 · Testing
 Unit Tests :p7a, 2026-07-21, 2d
 Integration Tests :p7b, 2026-07-22, 2d
 E2E Tests (Playwright) :p7c, 2026-07-23, 2d
 UAT :p7d, 2026-07-24, 2d

 section Phase 8 · Deployment
 Docker Setup :p8a, 2026-07-25, 1d
 Nginx + SSL Config :p8b, 2026-07-25, 1d
 Production Deploy :p8c, 2026-07-26, 1d
 Smoke Tests :p8d, 2026-07-27, 1d
```

### 3.2 Sprint Plan

| Sprint | Duration | Gautam (Frontend) | Yogesh (Backend) |
|---|---|---|---|
| Sprint 0 | Day 1 | Monorepo setup, Tailwind, shadcn | Monorepo setup, Express, Prisma |
| Sprint 1 | Days 2–8 | Design system, Auth UI, Admin Dashboard | Auth API, DB schema, Sessions API |
| Sprint 2 | Days 9–14 | SM workflow, Charts, Reports UI | Sperto integration, Analytics API, Export |
| Sprint 3 | Days 15–18 | Notifications, Settings, Polish | Security hardening, Rate limiting |
| Sprint 4 | Days 19–21 | E2E tests, Bug fixes | Docker, Deployment, Smoke tests |

---

## 4. Phase 2 — Requirements Analysis

### 4.1 Stakeholder Map

```mermaid
mindmap
 root((Sperto Dashboard))
 Admin
 View All Sessions
 Manage Devices
 Manage Users
 View Analytics
 Export Reports
 View API Logs
 Sales Manager
 Login
 Validate Customer
 Start Presentation
 End Presentation
 View Own History
 System
 Sperto API
 PostgreSQL
 JWT Auth
 WebSockets/SSE
 External
 Sperto API Server
 Email Provider
 Cloud Host
```

### 4.2 Requirements Prioritization (MoSCoW)

```mermaid
quadrantChart
 title Requirements Priority Matrix
 x-axis Low Effort --> High Effort
 y-axis Low Value --> High Value
 quadrant-1 Do First
 quadrant-2 Schedule
 quadrant-3 Delegate
 quadrant-4 Avoid
 JWT Auth: [0.2, 0.95]
 Sperto API Integration: [0.45, 0.98]
 Session Start/End: [0.3, 0.97]
 Admin Dashboard KPIs: [0.35, 0.85]
 Analytics Charts: [0.5, 0.75]
 Live Session Timer: [0.25, 0.8]
 Reports Export: [0.6, 0.7]
 API Logs Page: [0.4, 0.65]
 Dark Mode: [0.3, 0.5]
 Email Notifications: [0.55, 0.55]
 PDF Viewer: [0.75, 0.45]
 Mobile App: [0.9, 0.3]
```

---

## 5. Phase 3 — System Design

### 5.1 High-Level System Architecture

```mermaid
graph TB
 subgraph Client[" Client Layer"]
 Browser["Next.js 15 Browser App"]
 end

 subgraph Gateway[" API Gateway Layer"]
 Nginx["Nginx Reverse Proxy\n(SSL Termination)"]
 end

 subgraph App["️ Application Layer"]
 Next["Next.js Server\n:3000"]
 Express["Express.js API\n:4000"]
 end

 subgraph Data["️ Data Layer"]
 PG["PostgreSQL 16\nPrimary DB"]
 Cache["Redis Cache\n(Sessions/Rate Limits)"]
 end

 subgraph External[" External Services"]
 Sperto["Sperto API\nnet4hgc.sperto.co.in"]
 SMTP["Email Server\n(SMTP)"]
 end

 Browser --> Nginx
 Nginx --> Next
 Nginx --> Express
 Next --> Express
 Express --> PG
 Express --> Cache
 Express --> Sperto
 Express --> SMTP

 style Client fill:#dbeafe
 style Gateway fill:#fef3c7
 style App fill:#d1fae5
 style Data fill:#ede9fe
 style External fill:#fee2e2
```

### 5.2 Database Entity Relationship Diagram

```mermaid
erDiagram
 USERS {
 string id PK
 string name
 string email UK
 string passwordHash
 enum role
 string avatar
 boolean isActive
 datetime createdAt
 datetime updatedAt
 }

 DEVICES {
 string id PK
 string deviceId UK
 string deviceName
 string assignedTo FK
 enum status
 datetime lastSeen
 datetime createdAt
 }

 CUSTOMERS {
 string id PK
 string leadId UK
 string name
 datetime createdAt
 }

 SESSIONS {
 string id PK
 string deviceId FK
 string customerId FK
 string salesManagerId FK
 datetime startTime
 datetime endTime
 int durationSeconds
 enum status
 datetime createdAt
 }

 API_LOGS {
 string id PK
 string endpoint
 string method
 json requestBody
 json responseBody
 int statusCode
 int executionMs
 boolean isSuccess
 datetime createdAt
 }

 AUDIT_LOGS {
 string id PK
 string userId FK
 string action
 json metadata
 string ip
 datetime createdAt
 }

 REFRESH_TOKENS {
 string id PK
 string token UK
 string userId FK
 datetime expiresAt
 datetime createdAt
 }

 USERS ||--o{ SESSIONS : "conducts"
 USERS ||--o{ DEVICES : "assigned to"
 USERS ||--o{ AUDIT_LOGS : "generates"
 USERS ||--o{ REFRESH_TOKENS : "has"
 DEVICES ||--o{ SESSIONS : "used in"
 CUSTOMERS ||--o{ SESSIONS : "participates in"
```

---

## 6. Phase 4 — Architecture Design

### 6.1 Frontend Architecture

```mermaid
graph TD
 subgraph NextJS["Next.js 15 App Router"]
 MW[middleware.ts\nRoute Guard]
 
 subgraph AuthPages["(auth) Group"]
 Login["/login"]
 Forgot["/forgot-password"]
 Reset["/reset-password"]
 end

 subgraph DashPages["(dashboard) Group"]
 Layout[layout.tsx\nSidebar + Header]
 AdminHome["/dashboard\nAdmin Overview"]
 SMHome["/dashboard\nSM Home"]
 Present["/present\nPresentation Flow"]
 Sessions["/sessions"]
 LiveSessions["/sessions/live"]
 Devices["/devices"]
 Customers["/customers"]
 Managers["/managers"]
 Analytics["/analytics"]
 Reports["/reports"]
 Logs["/logs"]
 Settings["/settings"]
 Users["/users"]
 end
 end

 subgraph StateLayer["State Management"]
 Zustand["Zustand Store\n- authStore\n- sessionStore\n- notificationStore"]
 TanStack["TanStack Query\n- Server State\n- Cache\n- Auto-refresh"]
 end

 subgraph Services["Service Layer"]
 AuthSvc["auth.service.ts"]
 SessionSvc["session.service.ts"]
 DeviceSvc["device.service.ts"]
 AnalyticsSvc["analytics.service.ts"]
 Axios["Axios Instance\n+ Interceptors\n+ Auto Refresh"]
 end

 MW --> AuthPages
 MW --> DashPages
 DashPages --> Zustand
 DashPages --> TanStack
 TanStack --> Services
 Services --> Axios

 style NextJS fill:#dbeafe
 style StateLayer fill:#d1fae5
 style Services fill:#fef3c7
```

### 6.2 Backend Architecture

```mermaid
graph TD
 subgraph Express["Express.js API Server"]
 App[app.ts\nExpress Application]
 
 subgraph Middleware["Global Middleware Stack"]
 Helmet[helmet\nSecurity Headers]
 CORS[cors\nOrigin Control]
 RateLimit[rate-limit\n100 req/15min]
 APILogger[apiLogger\nLog all requests]
 AuthMW[auth.middleware\nJWT Verify]
 RBAC[rbac.middleware\nRole Guard]
 Validate[validate.middleware\nZod Schema]
 ErrorHandler[errorHandler\nGlobal Catch]
 end

 subgraph Modules["Feature Modules"]
 AuthMod["/auth\nauth.controller\nauth.service"]
 UsersMod["/users\nusers.controller\nusers.service"]
 DevicesMod["/devices\ndevices.controller\ndevices.service"]
 SessionsMod["/sessions\nsessions.controller\nsessions.service"]
 SpertoMod["/sperto\nsperto.service\nExternal API Proxy"]
 AnalyticsMod["/analytics\nanalytics.service"]
 ReportsMod["/reports\nreports.service"]
 LogsMod["/logs\nlogs.service"]
 end

 subgraph Lib["Shared Libraries"]
 Prisma[prisma.ts\nDB Client]
 JWT[jwt.ts\nToken Utils]
 Bcrypt[bcrypt.ts\nPassword Hash]
 Response[response.ts\nStandard Response]
 end
 end

 App --> Middleware
 Middleware --> Modules
 Modules --> Lib

 style Express fill:#d1fae5
 style Middleware fill:#fef3c7
 style Modules fill:#dbeafe
 style Lib fill:#ede9fe
```

---

## 7. Phase 5 — Implementation

### 7.1 Git Branching Strategy

```mermaid
gitGraph
 commit id: "Initial monorepo setup"
 
 branch develop
 checkout develop
 commit id: "Project scaffolding"

 branch feature/auth-backend
 checkout feature/auth-backend
 commit id: "Prisma schema"
 commit id: "Auth API endpoints"
 commit id: "JWT + refresh tokens"
 
 checkout develop
 merge feature/auth-backend id: "Merge: Auth backend"

 branch feature/auth-frontend
 checkout feature/auth-frontend
 commit id: "Login page"
 commit id: "Auth store (Zustand)"
 commit id: "Route protection"

 checkout develop
 merge feature/auth-frontend id: "Merge: Auth frontend"

 branch feature/sessions
 checkout feature/sessions
 commit id: "Sessions API"
 commit id: "Sperto integration"
 commit id: "SM presentation flow"

 checkout develop
 merge feature/sessions id: "Merge: Sessions"

 branch feature/analytics
 checkout feature/analytics
 commit id: "Analytics API"
 commit id: "Charts (Recharts)"

 checkout develop
 merge feature/analytics id: "Merge: Analytics"

 checkout main
 merge develop id: "v1.0.0 Release" tag: "v1.0.0"
```

### 7.2 CI/CD Pipeline

```mermaid
flowchart LR
 A([‍ Developer\nPushes Code]) --> B[GitHub Actions\nTriggered]
 
 B --> C{Branch?}
 C -->|feature/*| D[ PR Checks]
 C -->|develop| E[ Full Test Suite]
 C -->|main| F[ Production Deploy]

 D --> D1[ESLint + TypeCheck]
 D --> D2[Unit Tests]
 D --> D3[Build Check]
 D1 & D2 & D3 --> D4{All Pass?}
 D4 -->|Yes| D5[ PR Approved]
 D4 -->|No| D6[ Block Merge]

 E --> E1[Unit Tests]
 E --> E2[Integration Tests]
 E --> E3[E2E Tests\nPlaywright]
 E1 & E2 & E3 --> E4{All Pass?}
 E4 -->|Yes| E5[Build Docker Images]
 E5 --> E6[Push to Registry]
 E6 --> E7[Deploy to Staging]
 E4 -->|No| E8[ Notify Team]

 F --> F1[Run All Tests]
 F1 --> F2{Pass?}
 F2 -->|Yes| F3[Build Production\nDocker Images]
 F3 --> F4[Blue-Green Deploy]
 F4 --> F5[Smoke Tests]
 F5 --> F6{Pass?}
 F6 -->|Yes| F7[ Production Live]
 F6 -->|No| F8[ Rollback]
 F2 -->|No| F9[ Block Release]

 style A fill:#6366f1,color:#fff
 style F7 fill:#10b981,color:#fff
 style D6 fill:#ef4444,color:#fff
 style E8 fill:#ef4444,color:#fff
 style F8 fill:#f59e0b,color:#fff
 style F9 fill:#ef4444,color:#fff
```

---

## 8. Phase 6 — Testing & QA

### 8.1 Testing Pyramid

```mermaid
graph TB
 subgraph Pyramid["Testing Strategy Pyramid"]
 E2E[" E2E Tests\nPlaywright\n~20 scenarios\nSlowest · Highest Value"]
 INT[" Integration Tests\nSupertest + Jest\n~60 test cases\nAPI contract testing"]
 UNIT["🟦 Unit Tests\nJest + Testing Library\n~200 test cases\nFastest · Most Granular"]
 end

 UNIT --> INT --> E2E

 style E2E fill:#ef4444,color:#fff
 style INT fill:#f59e0b,color:#fff
 style UNIT fill:#10b981,color:#fff
```

### 8.2 Test Coverage Plan

```mermaid
mindmap
 root((Test Coverage))
 Unit Tests
 Auth Service
 Login validation
 Password hashing
 Token generation
 Session Service
 Start session logic
 End session + duration
 Status transitions
 Sperto Service
 API call formation
 Error handling
 Retry logic
 React Components
 LoginForm rendering
 KPICard values
 SessionTimer counting
 Integration Tests
 POST /auth/login
 POST /sessions/start
 POST /sessions/end
 GET /analytics/overview
 POST /sperto/validate-customer
 E2E Tests
 Admin login flow
 SM complete session flow
 Admin dashboard loads
 Session history filters
 Report export
```

### 8.3 QA Gate Checklist

```mermaid
flowchart TD
 Start([🟢 Start QA]) --> A

 A[Code Review\nPassed] -->|| B[Unit Tests\n≥ 80% Coverage]
 A -->|| FAIL1[ Return to Dev]

 B -->|| C[Integration Tests\nAll Pass]
 B -->|| FAIL2[ Fix Tests]

 C -->|| D[E2E Tests\nAll Scenarios Pass]
 C -->|| FAIL3[ Fix Integration]

 D -->|| E[Performance Test\nLighthouse ≥ 85]
 D -->|| FAIL4[ Fix E2E]

 E -->|| F[Security Scan\nNo Critical Issues]
 E -->|| FAIL5[ Optimize]

 F -->|| G[UAT Sign-off]
 F -->|| FAIL6[ Patch Security]

 G -->|| PASS([ Ready for Deploy])
 G -->|| FAIL7[ Fix UAT Issues]

 style PASS fill:#10b981,color:#fff
 style Start fill:#6366f1,color:#fff
 style FAIL1 fill:#ef4444,color:#fff
 style FAIL2 fill:#ef4444,color:#fff
 style FAIL3 fill:#ef4444,color:#fff
 style FAIL4 fill:#ef4444,color:#fff
 style FAIL5 fill:#ef4444,color:#fff
 style FAIL6 fill:#ef4444,color:#fff
 style FAIL7 fill:#ef4444,color:#fff
```

---

## 9. Phase 7 — Deployment

### 9.1 Deployment Architecture

```mermaid
graph TB
 subgraph Internet[" Internet"]
 Users["Users / Browsers"]
 end

 subgraph Server["️ Cloud Server (VPS / Railway)"]
 subgraph DockerNetwork["Docker Network: sperto-net"]
 Nginx["Nginx Container\n:80 / :443\nReverse Proxy + SSL"]
 Web["Next.js Container\n:3000\nFrontend App"]
 API["Express Container\n:4000\nBackend API"]
 DB["PostgreSQL Container\n:5432\nPrimary Database"]
 Redis["Redis Container\n:6379\nCache + Rate Limit"]
 end
 Volumes[" Persistent Volumes\n- postgres_data\n- redis_data\n- uploads"]
 end

 subgraph External[" External"]
 SpertoAPI["Sperto API\nnet4hgc.sperto.co.in"]
 end

 Users --> Nginx
 Nginx -->|"/* "| Web
 Nginx -->|"/api/*"| API
 Web --> API
 API --> DB
 API --> Redis
 API --> SpertoAPI
 DB --> Volumes
 Redis --> Volumes

 style Internet fill:#dbeafe
 style DockerNetwork fill:#d1fae5
 style External fill:#fee2e2
```

### 9.2 Release Process

```mermaid
sequenceDiagram
 participant Dev as ‍ Developer
 participant GH as GitHub
 participant CI as CI/CD Pipeline
 participant Staging as Staging Server
 participant Prod as Production Server
 participant Team as Team

 Dev->>GH: git push origin main (v1.0.0 tag)
 GH->>CI: Trigger Release Workflow
 CI->>CI: Run full test suite
 CI->>CI: Build Docker images
 CI->>CI: Push images to registry
 CI->>Staging: Deploy to staging
 CI->>Team: Notify: Staging ready for review
 Team->>Staging: Manual smoke test
 Team->>GH: Approve Release
 GH->>CI: Trigger Production Deploy
 CI->>Prod: Pull new images
 CI->>Prod: docker-compose up --no-downtime
 CI->>Prod: Run smoke tests
 Prod-->>CI: Health check OK
 CI->>Team: Production deployed successfully
```

---

## 10. Phase 8 — Maintenance

### 10.1 Monitoring & Alerting

```mermaid
graph LR
 subgraph App["Application"]
 API["Express API"]
 Next["Next.js App"]
 DB["PostgreSQL"]
 end

 subgraph Monitor["Monitoring Stack"]
 Health["Health Endpoint\n/api/health"]
 Logs["Log Aggregation\n(Winston + File)"]
 Metrics["Metrics\n(custom /api/metrics)"]
 end

 subgraph Alerts["Alerting"]
 Email[" Email Alert"]
 Slack[" Slack Webhook"]
 end

 API --> Health
 API --> Logs
 API --> Metrics
 Next --> Logs
 DB --> Metrics

 Metrics -->|"Error rate > 1%"| Email
 Metrics -->|"Response > 2s"| Slack
 Health -->|"Down > 30s"| Email
 Health -->|"Down > 30s"| Slack

 style App fill:#dbeafe
 style Monitor fill:#d1fae5
 style Alerts fill:#fef3c7
```

### 10.2 Bug Fix Workflow

```mermaid
flowchart TD
 A([ Bug Reported]) --> B{Severity?}
 
 B -->|Critical P0\nProduction Down| C[Immediate Hotfix\nWithin 2 hours]
 B -->|High P1\nFeature Broken| D[Fix in 24 hours\nHotfix branch]
 B -->|Medium P2\nDegraded UX| E[Fix in current sprint]
 B -->|Low P3\nMinor Issue| F[Backlog for next sprint]

 C --> C1[Create hotfix branch]
 C1 --> C2[Implement fix]
 C2 --> C3[Emergency review]
 C3 --> C4[Deploy to production]
 C4 --> C5[Post-mortem]

 D --> D1[Create hotfix branch]
 D1 --> D2[Implement + test]
 D2 --> D3[PR review]
 D3 --> D4[Merge + deploy]

 E --> E1[Add to sprint backlog]
 E1 --> E2[Standard dev flow]

 F --> F1[Document in backlog]

 style A fill:#ef4444,color:#fff
 style C fill:#dc2626,color:#fff
 style D fill:#f59e0b,color:#fff
 style E fill:#3b82f6,color:#fff
 style F fill:#64748b,color:#fff
```

---

## 11. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Sperto API unavailable | Medium | High | Implement retry + circuit breaker, cache last response |
| R2 | PostgreSQL data loss | Low | Critical | Daily automated backups, WAL archiving |
| R3 | JWT secret compromise | Low | Critical | Rotate secrets, use refresh token rotation |
| R4 | Scope creep | High | Medium | Strict MoSCoW prioritization, sprint goals locked |
| R5 | Team member unavailable | Medium | High | Document everything, shared code ownership |
| R6 | Sperto API rate limiting | Low | Medium | Throttle our proxy layer, queue requests |
| R7 | Large data set performance | Medium | Medium | DB indexing, pagination, query optimization |

```mermaid
quadrantChart
 title Risk Matrix
 x-axis Low Probability --> High Probability
 y-axis Low Impact --> High Impact
 quadrant-1 Monitor Closely
 quadrant-2 Mitigate Urgently
 quadrant-3 Accept
 quadrant-4 Watch
 Sperto API Down: [0.45, 0.8]
 DB Data Loss: [0.15, 0.98]
 JWT Compromise: [0.1, 0.95]
 Scope Creep: [0.75, 0.55]
 Team Unavailable: [0.4, 0.75]
 API Rate Limit: [0.25, 0.45]
 Performance Issues: [0.5, 0.6]
```

---

## 12. Team & Responsibilities

### RACI Matrix

| Task | Gautam | Yogesh |
|---|---|---|
| Database Schema | C | **R** |
| Backend APIs | C | **R** |
| Sperto Integration | C | **R** |
| Security Hardening | C | **R** |
| Docker + Deployment | C | **R** |
| Design System | **R** | C |
| Frontend Pages | **R** | C |
| State Management | **R** | C |
| Charts & Analytics UI | **R** | C |
| Authentication UI | **R** | C |
| Testing (shared) | **R** | **R** |
| Documentation | **R** | **R** |

> **R** = Responsible · **C** = Consulted

---

*Document maintained by Gautam & Yogesh · Last updated: June 30, 2026*
