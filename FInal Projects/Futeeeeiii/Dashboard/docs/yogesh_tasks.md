# ️ Yogesh — Backend Lead Task Document
## Sperto Dashboard · Node.js · Express.js · PostgreSQL · Prisma

> **Role**: Backend & Infrastructure Lead 
> **Stack**: Node.js · Express.js · TypeScript · Prisma ORM · PostgreSQL · JWT · Docker 
> **Your Dev Port**: `4000` 
> **Frontend URL**: `http://localhost:3000` (Gautam's app)

---

## Quick Start (Day 1 — Run These First)

```bash
# Step 1: Start PostgreSQL via Docker
cd /path/to/Dashboard
docker-compose up -d

# Step 2: Install dependencies
cd apps/api
npm install

# Step 3: Create your .env file
cp .env.example .env
# Edit .env and fill in real values

# Step 4: Push Prisma schema to DB + run migrations
npx prisma migrate dev --name init

# Step 5: Seed the database with test data
npm run db:seed

# Step 6: Start the API server
npm run dev
```

**API will be live at**: `http://localhost:4000` 
**Test it**: `GET http://localhost:4000/api/health` → should return `{ status: "ok" }`

---

## Your Folder Structure (All in `apps/api/src/`)

```
apps/api/
├── prisma/
│ ├── schema.prisma ← Database schema (YOU OWN THIS)
│ └── seed.ts ← Test data seeding script
├── src/
│ ├── app.ts ← Express app entry point
│ ├── config/
│ │ ├── database.ts ← Prisma client singleton
│ │ └── logger.ts ← Winston logger
│ ├── lib/
│ │ └── jwt.ts ← Token generation/verification
│ ├── middleware/
│ │ ├── auth.middleware.ts ← JWT verification
│ │ ├── rbac.middleware.ts ← Role guard (ADMIN/SALES_MANAGER)
│ │ ├── validate.middleware.ts ← Zod schema validation
│ │ └── errorHandler.middleware.ts ← Global error catcher
│ ├── utils/
│ │ └── response.ts ← sendSuccess() / sendError() helpers
│ └── modules/
│ ├── auth/
│ ├── users/
│ ├── devices/
│ ├── sessions/ ← includes sse.manager.ts
│ ├── sperto/ ← External API proxy
│ ├── analytics/
│ ├── reports/ ← CSV, Excel, PDF generation
│ └── logs/
├── .env
├── .env.example
├── nodemon.json
├── tsconfig.json
└── package.json
```

---

## Task Checklist (In Order)

---

### Phase 0: Environment Setup (Day 1)

- [ ] **Install all packages**
 ```bash
 cd apps/api && npm install
 ```

- [ ] **Copy and fill `.env` file**
 ```bash
 cp .env.example .env
 ```
 Fill in:
 ```env
 PORT=4000
 DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sperto_db?schema=public"
 JWT_SECRET="sperto_super_secret_access_key_12345"
 JWT_REFRESH_SECRET="sperto_super_secret_refresh_key_54321"
 SPERTO_API_KEY="YOUR_ACTUAL_SPERTO_API_KEY"
 SPERTO_BASE_URL="https://net4hgc.sperto.co.in/_api"
 NODE_ENV="development"
 FRONTEND_URL="http://localhost:3000"
 ```

- [ ] **Start PostgreSQL via Docker**
 ```bash
 # From root Dashboard/ folder:
 docker-compose up -d
 docker ps # Verify sperto-postgres is running on port 5432
 ```

- [ ] **Run Prisma migration + generate client**
 ```bash
 cd apps/api
 npx prisma migrate dev --name init
 npx prisma generate
 ```

- [ ] **Seed test data**
 ```bash
 npm run db:seed
 ```
 After seeding, share these creds with Gautam:
 | Role | Email | Password |
 |---|---|---|
 | Admin | `admin@sperto.com` | `admin123` |
 | Sales Manager 1 | `manager1@sperto.com` | `manager123` |
 | Sales Manager 2 | `manager2@sperto.com` | `manager123` |

- [ ] **Start dev server and verify**
 ```bash
 npm run dev
 curl http://localhost:4000/api/health
 # Expected: { "status": "ok" }
 ```

---

### ️ Phase 1: Database Schema (Days 1–2)

Schema is already in `apps/api/prisma/schema.prisma`. Your job:

- [ ] **Add performance indexes** — edit schema.prisma, add to Session and ApiLog models:
 ```prisma
 model Session {
 // ... existing fields ...
 @@index([salesManagerId])
 @@index([status])
 @@index([startTime])
 @@index([deviceId])
 }

 model ApiLog {
 // ... existing fields ...
 @@index([createdAt])
 @@index([isSuccess])
 }
 ```
 Then: `npx prisma migrate dev --name add_indexes`

- [ ] **Verify schema in Prisma Studio**
 ```bash
 npm run db:studio
 # Opens at http://localhost:5555
 ```

---

### Phase 2: Auth Module Testing (Days 2–4)

All files exist in `src/modules/auth/`. **Test every endpoint:**

- [ ] **Test login (Admin)**
 ```bash
 curl -X POST http://localhost:4000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@sperto.com","password":"admin123"}'
 # Must return: accessToken + Set-Cookie refreshToken
 ```

- [ ] **Test refresh token**
 ```bash
 curl -X POST http://localhost:4000/api/auth/refresh \
 -H "Cookie: refreshToken=YOUR_TOKEN"
 # Must return new accessToken
 ```

- [ ] **Test logout**
 ```bash
 curl -X POST http://localhost:4000/api/auth/logout \
 -H "Cookie: refreshToken=YOUR_TOKEN"
 ```

- [ ] **Test wrong password** → must return 401, NOT 500
- [ ] **Test forgot password** → returns mock token message in dev mode

---

### Phase 3: Users + Devices Modules (Days 3–4)

All files exist. **Test these:**

- [ ] Admin can list all users: `GET /api/users`
- [ ] SM gets 403 on user list
- [ ] Admin can create a user: `POST /api/users`
- [ ] Admin can list devices: `GET /api/devices`
- [ ] Admin can register device: `POST /api/devices`
- [ ] Admin can assign device to SM: `PATCH /api/devices/:id/assign`
- [ ] SM gets 403 on any device endpoint

---

### Phase 4: Sessions + Sperto Integration (Days 5–7) ️ CRITICAL

All files exist. This is the most important module to get right.

- [ ] **Test Sperto mock customer validation**
 ```bash
 # Get SM token first, then:
 curl -X POST http://localhost:4000/api/sperto/validate-customer \
 -H "Authorization: Bearer SM_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"leadId":"lead-001"}'
 # Expected: { data: { name: "Rajesh Sharma", leadId: "lead-001" } }
 ```

- [ ] **Start a session**
 ```bash
 curl -X POST http://localhost:4000/api/sessions/start \
 -H "Authorization: Bearer SM_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"leadId":"lead-001"}'
 # Expected: { data: { sessionId: "...", startTime: "...", customerName: "Rajesh Sharma" } }
 ```

- [ ] **Check ApiLog table** — must have entry for Sperto IN call
 ```bash
 npm run db:studio # check ApiLog table
 ```

- [ ] **Check live sessions (Admin)**
 ```bash
 curl http://localhost:4000/api/sessions/live \
 -H "Authorization: Bearer ADMIN_TOKEN"
 # Must show the active session
 ```

- [ ] **End the session**
 ```bash
 curl -X POST http://localhost:4000/api/sessions/end \
 -H "Authorization: Bearer SM_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"sessionId":"SESSION_UUID"}'
 # Expected: { data: { durationSeconds: N, status: "COMPLETED" } }
 ```

- [ ] **Check ApiLog table again** — must have Sperto OUT call entry

- [ ] **Test SSE stream**
 ```bash
 # Terminal 1: Connect to SSE
 curl -N http://localhost:4000/api/sessions/stream \
 -H "Authorization: Bearer ADMIN_TOKEN"

 # Terminal 2: Start a session
 # → Terminal 1 must print: event: session_started data: {...}
 ```

- [ ] **Test error cases:**
 - SM with no device → start session → 400 "No device assigned"
 - SM with active session → start another → 400 "Active session exists"

---

### Phase 5: Analytics Module (Days 7–9)

All files exist. **Test all endpoints with Admin token:**

- [ ] `GET /api/analytics/overview` → 9 KPI values
- [ ] `GET /api/analytics/sessions-per-day` → array of `{ date, count }`
- [ ] `GET /api/analytics/sessions-per-hour` → 24 hour objects
- [ ] `GET /api/analytics/device-usage` → device session counts
- [ ] `GET /api/analytics/manager-performance` → manager stats

---

### Phase 6: Reports Module (Days 9–10)

All files exist. **Test all 3 formats:**

- [ ] CSV export
 ```bash
 curl "http://localhost:4000/api/reports/export?format=csv" \
 -H "Authorization: Bearer ADMIN_TOKEN" \
 --output sessions.csv && open sessions.csv
 ```

- [ ] Excel export
 ```bash
 curl "http://localhost:4000/api/reports/export?format=excel" \
 -H "Authorization: Bearer ADMIN_TOKEN" \
 --output sessions.xlsx && open sessions.xlsx
 ```

- [ ] PDF export
 ```bash
 curl "http://localhost:4000/api/reports/export?format=pdf" \
 -H "Authorization: Bearer ADMIN_TOKEN" \
 --output sessions.pdf && open sessions.pdf
 ```

---

### Phase 7: Logs Module + Retry (Day 10)

- [ ] `GET /api/logs` → lists API call history (Admin only)
- [ ] `GET /api/logs?success=false` → only failed calls
- [ ] `POST /api/logs/:id/retry` → retries a failed Sperto call

---

### Phase 8: Notifications Module (Day 11) — YOU NEED TO CREATE THIS

Notifications are created automatically inside `sessions.service.ts`. You need to expose the **read endpoints**:

- [ ] **Create `src/modules/notifications/notifications.controller.ts`**:
 ```typescript
 import prisma from '../../config/database';
 import { sendSuccess } from '../../utils/response';
 import { Response, NextFunction } from 'express';
 import { AuthenticatedRequest } from '../../middleware/auth.middleware';

 export class NotificationsController {
 static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 const notifications = await prisma.notification.findMany({
 where: { userId: req.user!.id },
 orderBy: { createdAt: 'desc' },
 take: 50,
 });
 return sendSuccess(res, notifications, 'Notifications retrieved');
 }

 static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 await prisma.notification.updateMany({
 where: { userId: req.user!.id },
 data: { isRead: true },
 });
 return sendSuccess(res, null, 'All notifications marked as read');
 }

 static async markOneRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 await prisma.notification.update({
 where: { id: req.params.id },
 data: { isRead: true },
 });
 return sendSuccess(res, null, 'Notification marked as read');
 }
 }
 ```

- [ ] **Create `src/modules/notifications/notifications.routes.ts`**:
 ```typescript
 import { Router } from 'express';
 import { NotificationsController } from './notifications.controller';
 import { authenticate } from '../../middleware/auth.middleware';

 const router = Router();
 router.use(authenticate);
 router.get('/', NotificationsController.list);
 router.patch('/mark-all-read', NotificationsController.markAllRead);
 router.patch('/:id/read', NotificationsController.markOneRead);
 export default router;
 ```

- [ ] **Register in `app.ts`**:
 ```typescript
 import notificationsRoutes from './modules/notifications/notifications.routes';
 app.use('/api/notifications', notificationsRoutes);
 ```

---

### Phase 9: Security Hardening (Days 10–12)

- [ ] **Add rate limiting** to `app.ts`:
 ```typescript
 import rateLimit from 'express-rate-limit';

 const apiLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100,
 message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }
 });
 const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 10,
 });
 app.use('/api/', apiLimiter);
 app.use('/api/auth/', authLimiter);
 ```

- [ ] **Load dotenv at the very top of `app.ts`**:
 ```typescript
 import 'dotenv/config'; // Must be FIRST import
 ```

- [ ] **Test Helmet headers** are being sent:
 ```bash
 curl -I http://localhost:4000/api/health
 # Check for: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
 ```

- [ ] **Verify no stack traces exposed in production**:
 ```bash
 NODE_ENV=production npm start
 # Trigger an error and check response — must NOT show stack trace
 ```

---

### Phase 10: Docker Deployment (Days 14–15)

- [ ] **Create `apps/api/Dockerfile`**:
 ```dockerfile
 FROM node:20-alpine AS builder
 WORKDIR /app
 COPY package*.json ./
 COPY prisma ./prisma/
 RUN npm ci
 COPY . .
 RUN npm run build
 RUN npx prisma generate

 FROM node:20-alpine AS runner
 WORKDIR /app
 ENV NODE_ENV=production
 COPY --from=builder /app/dist ./dist
 COPY --from=builder /app/node_modules ./node_modules
 COPY --from=builder /app/prisma ./prisma
 EXPOSE 4000
 CMD ["node", "dist/app.js"]
 ```

- [ ] **Update `docker-compose.yml`** (root folder) to include web + api + postgres
- [ ] **Test full stack**: `docker-compose up --build`

---

## Sync Points with Gautam

| Day | What to Tell Gautam |
|---|---|
| Day 1 end | API running on :4000. Seed done. Creds ready |
| Day 3 | Auth API tested. He can build login UI |
| Day 5 | Sessions API ready. Mock lead IDs: `lead-001`, `lead-002` |
| Day 7 | SSE stream working. Analytics APIs ready |
| Day 9 | Reports export tested. Notifications endpoints up |
| Day 13 | Full integration test together |

---

## Common Issues & Fixes

| Issue | Fix |
|---|---|
| `Prisma client not generated` | `npx prisma generate` |
| `Cannot connect to DB` | `docker ps` — check postgres container |
| `JWT_SECRET undefined` | Check `.env` file exists + `import 'dotenv/config'` at top |
| `CORS error from Gautam` | Set `FRONTEND_URL=http://localhost:3000` in `.env` |
| `Sperto API timeout` | Normal without real API key — mock mode handles it |
| `Port 4000 in use` | `lsof -i :4000` then kill process |
| `ts-node not found` | `npm install` inside `apps/api` |

---

## Mock Customer Lead IDs (for Sperto Testing)

| Lead ID | Mock Name Returned |
|---|---|
| `lead-001` | Rajesh Sharma |
| `lead-002` | Siddharth Roy |
| `lead-003` | Amit Patel |
| `lead-004` | Priya Nair |
| Any `mock-*` ID | Generic mock name |

> **Note**: Mock mode activates automatically when `SPERTO_API_KEY=MOCK_SPERTO_KEY` 
> Once you have the real API key, update `.env` and restart server.

---

*Document owner: Yogesh · Last updated: June 30, 2026*
