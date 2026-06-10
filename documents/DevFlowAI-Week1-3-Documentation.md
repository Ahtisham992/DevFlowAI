# DevFlow AI — Week 1-3 Complete Documentation

> **Stack:** Next.js · NestJS · PostgreSQL · Redis · Ollama · React Native · Prisma · Docker  
> **Period:** Week 1–3 (Days 1–30)  
> **Status:** Foundation + Auth + Dashboard + Projects Complete

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Infrastructure & Docker](#3-infrastructure--docker)
4. [Database Design (Prisma)](#4-database-design-prisma)
5. [Authentication System](#5-authentication-system)
6. [Backend Architecture (NestJS)](#6-backend-architecture-nestjs)
7. [Frontend Architecture (Next.js)](#7-frontend-architecture-nextjs)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Week-by-Week Build Log](#9-week-by-week-build-log)
10. [Issues Encountered & Fixes](#10-issues-encountered--fixes)
11. [What Comes Next](#11-what-comes-next)

---

## 1. Project Overview

**DevFlow AI** is an AI-powered developer workspace that eliminates context-switching by combining project planning, code understanding, debugging assistance, documentation generation, and developer notes into one platform. All AI runs locally via Ollama — your code never leaves your machine.

### Vision Statement

> *"One workspace. Every developer workflow. Zero cloud dependency for AI."*

### The Problem We Solve

Developers today suffer from workflow fragmentation:

- Project planning scattered across Notion, Jira, sticky notes
- AI tools like GitHub Copilot cost $20+/month and send your code to external servers
- No single unified workspace exists for developers
- Debugging alone with no contextual help is slow and frustrating
- Documentation is always postponed because it takes too long

### Complete Technology Stack

| Technology | Purpose | Why We Chose It |
|---|---|---|
| Next.js 15 | Web Frontend | App Router, SSR, excellent DX with TypeScript |
| NestJS | Backend API | Structured, scalable, dependency injection like Spring |
| PostgreSQL 16 | Primary Database | Robust relational DB, supports pgvector for AI embeddings |
| Redis 7 | Cache & Sessions | Fast in-memory store for refresh token blacklisting |
| Ollama | Local AI Runtime | Run LLMs (Llama3, Mistral) locally — no API costs |
| Prisma 7 | ORM | Type-safe database queries, auto-generated migrations |
| React Native CLI | Mobile App | Native mobile with TypeScript — same language as web |
| Docker | Infrastructure | Containerizes PostgreSQL, Redis, Ollama consistently |
| JWT + bcrypt | Authentication | Industry standard stateless auth with secure password hashing |
| Zustand | Frontend State | Lightweight state management, simpler than Redux |
| React Query | Server State | Handles fetching, caching, optimistic updates automatically |
| shadcn/ui | UI Components | Accessible, customizable components built on Radix UI |
| Zod | Validation | Type-safe schema validation for forms and API inputs |
| GitHub Actions | CI/CD | Automated lint and build checks on every push |

---

## 2. Project Structure

DevFlow AI uses a **monorepo** — all three apps live in one Git repository. This makes it easier to share types, coordinate changes, and deploy together.

```
devflow-ai/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   ├── backend/          # NestJS API server (port 3001)
│   └── mobile/           # React Native CLI app
│       └── DevFlowMobile/
├── packages/
│   └── shared/           # Shared TypeScript types (future use)
├── docker-compose.yml    # PostgreSQL + Redis + Ollama containers
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions CI pipeline
├── .gitignore
├── README.md
└── package.json          # Root package.json
```

### Why Monorepo?

- Single Git repository = one place for all code history
- Easy to share TypeScript types between frontend and backend
- One CI pipeline covers all three apps simultaneously
- Simpler for solo developers and small teams to manage

### Git Branch Strategy

- `main` — stable, production-ready code
- `develop` — active development (all work happens here)
- `feat/feature-name` — individual feature branches
- Merge `develop` → `main` at the end of each week

---

## 3. Infrastructure & Docker

We use Docker to run infrastructure services. PostgreSQL, Redis, and Ollama all run in isolated containers rather than being installed directly on Windows. This avoids version conflicts and makes setup reproducible on any machine.

### docker-compose.yml — What Each Service Does

#### PostgreSQL (`pgvector/pgvector:pg16`)

The main database. We use the **pgvector** variant because it adds vector similarity search — needed later for RAG (AI search over your codebase).

- Container name: `devflow_postgres`
- Database: `devflow_db`
- Username/Password: `devflow` / `devflow123`
- Port: **5433** (not default 5432 — avoids conflict with locally installed PostgreSQL on Windows)
- Data persists in a Docker volume so it survives container restarts

#### Redis (`redis:7-alpine`)

An in-memory key-value store. Used specifically for **refresh token blacklisting** — when a user logs out, their refresh token is stored in Redis with a 7-day expiry. If someone tries to reuse that token, we check Redis first and reject it.

- Container name: `devflow_redis`
- Port: `6379` (default)
- Alpine variant = smaller image size (~50MB vs ~100MB)

#### Ollama (`ollama/ollama`)

The local AI runtime. Downloads and manages LLM models (like Llama3) and exposes a simple HTTP API on port 11434. Our backend talks to Ollama instead of OpenAI — zero API costs, complete privacy.

- Container name: `devflow_ollama`
- Model: `llama3` (~4GB download)
- API: `http://localhost:11434`

### WSL 2 Requirement

Docker Desktop on Windows requires WSL 2 (Windows Subsystem for Linux). Installed by running `wsl --install` as Administrator, which set up Ubuntu alongside Windows. After a restart, Docker Desktop worked correctly.

### Port Conflict Issue & Fix

Windows had a local PostgreSQL installation on port 5432. Docker was hitting the local install instead of the container. **Fix:** Changed Docker port mapping to `5433:5432` in docker-compose.yml and updated `DATABASE_URL` to use port 5433.

---

## 4. Database Design (Prisma)

We use **Prisma** as our ORM (Object-Relational Mapper). Prisma reads `schema.prisma` and generates type-safe TypeScript code for database queries, plus handles migrations automatically.

### Why Prisma 7 Needs `prisma.config.ts`

Prisma 7 changed how database connections are configured. Instead of putting `DATABASE_URL` directly in `schema.prisma`, we now need a separate `prisma.config.ts` file that loads the URL from environment variables using `dotenv`. This is a security improvement — connection strings stay out of schema files.

```typescript
// prisma/prisma.config.ts
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: { url: process.env.DATABASE_URL! },
})
```

### Data Models Explained

#### User
The core identity. Every user has an email, hashed password, and optional name. Users own workspaces, notes, and conversations.

```
id          - UUID, auto-generated primary key
email       - Unique, used for login
password    - bcrypt hashed (NEVER stored as plain text)
name        - Optional display name
createdAt   - Auto timestamp on creation
updatedAt   - Auto-updated on every save
```

#### Workspace
A top-level container. Think of it like a folder. One user can have multiple workspaces (e.g., "Client Projects", "Side Projects"). Each workspace contains projects.

#### Project
Lives inside a workspace. Represents a specific codebase or task. Projects can have a GitHub URL, a status (`active`/`paused`/`completed`), and contain notes.

#### Note
A markdown text document. Notes belong to a user and optionally to a specific project. They support tags (stored as a PostgreSQL string array) for filtering.

#### Conversation + Message
These two models store AI chat history. A `Conversation` is a session (like a ChatGPT thread). `Messages` are individual turns — either `role: "user"` or `role: "assistant"`. The `model` field tracks which LLM was used.

### Relationships Summary

```
User (1) ──── (many) Workspace
Workspace (1) ──── (many) Project
Project (1) ──── (many) Note
User (1) ──── (many) Note        ← notes can exist without a project
User (1) ──── (many) Conversation
Conversation (1) ──── (many) Message
```

**All relationships use CASCADE delete** — deleting a workspace automatically deletes all its projects and notes.

### Running Migrations

```bash
# Create and apply a migration
npx prisma migrate dev --name init

# Generate TypeScript client after schema changes
npx prisma generate

# View data in browser UI
npx prisma studio

# Seed test data
npx prisma db seed
```

---

## 5. Authentication System

We built a complete **JWT-based authentication** system with access tokens, refresh tokens, and Redis-based logout blacklisting.

### How JWT Authentication Works

JWT (JSON Web Token) is a **stateless** authentication method. Instead of storing sessions in a database, the server creates a signed token containing the user ID. The client sends this token with every request, and the server verifies the signature to confirm it is legitimate — no database lookup needed for validation.

### Full Auth Flow Step by Step

```
1. User registers with email + password
2. Password is hashed with bcrypt (10 salt rounds) before saving to DB
3. Server returns TWO tokens:
   - accessToken  → short-lived (15 minutes)
   - refreshToken → long-lived (7 days)
4. Client stores accessToken in Zustand store + cookie
5. Client sends "Authorization: Bearer <token>" header with every API request
6. JwtAuthGuard validates token signature and expiry on every protected route
7. When accessToken expires → Axios interceptor auto-calls /auth/refresh
8. On logout → refreshToken is blacklisted in Redis for 7 days
```

### Why Two Tokens?

- **Access tokens** are short-lived (15 min) to minimize damage if stolen
- **Refresh tokens** are long-lived (7 days) but can be revoked in Redis
- This gives both **security** (short access window) and **convenience** (stay logged in for a week)
- If only one token: either short-lived = frequent logins, or long-lived = can't revoke on logout

### NestJS Auth Files

```
src/auth/
├── auth.module.ts              # Imports JwtModule, PassportModule, registers strategies
├── auth.service.ts             # register(), login(), refresh(), logout(), generateTokens()
├── auth.controller.ts          # Route handlers: POST /auth/register, /login, /refresh, /logout, GET /me
├── strategies/
│   ├── jwt.strategy.ts         # Validates access tokens from Authorization header
│   └── jwt-refresh.strategy.ts # Validates refresh tokens from request body
├── guards/
│   ├── jwt.guard.ts            # @UseGuards(JwtAuthGuard) — protects routes
│   └── jwt-refresh.guard.ts    # Used only on /auth/refresh endpoint
└── dto/
    ├── register.dto.ts         # email, password, name? — with class-validator decorators
    └── login.dto.ts            # email, password
```

### Redis Refresh Token Blacklisting

When a user logs out:
```typescript
// Store with 7-day TTL
await redis.set(`blacklist:${refreshToken}`, '1', 7 * 24 * 60 * 60)
```

On every refresh attempt:
```typescript
const blacklisted = await redis.get(`blacklist:${refreshToken}`)
if (blacklisted) throw new UnauthorizedException('Token revoked')
```

This prevents logout tokens from being reused even before they expire naturally.

### bcrypt Password Hashing

Plain text passwords are never stored:
```typescript
// On register — hash before saving
const hashed = await bcrypt.hash(password, 10) // 10 = salt rounds

// On login — compare plain text against hash
const valid = await bcrypt.compare(plainPassword, storedHash)
```

10 salt rounds makes brute force attacks computationally expensive (~100ms per attempt).

### @CurrentUser() Decorator

Instead of accessing `request.user` manually everywhere:
```typescript
// Custom decorator
export const CurrentUser = createParamDecorator(
  (data, ctx) => ctx.switchToHttp().getRequest().user
)

// Usage in any controller
@Get('me')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return user
}
```

---

## 6. Backend Architecture (NestJS)

NestJS uses a **module-based architecture**. Every feature is isolated in its own module with its own service, controller, and DTOs.

### Folder Structure

```
apps/backend/src/
├── main.ts                 # Entry point — registers ValidationPipe, CORS, port
├── app.module.ts           # Root module — imports all feature modules
├── prisma/
│   ├── prisma.module.ts    # @Global() — available everywhere without importing
│   └── prisma.service.ts   # Extends PrismaClient, connects on module init
├── redis/
│   ├── redis.module.ts     # @Global() — available everywhere
│   └── redis.service.ts    # get(), set(), delete() wrapping ioredis
├── auth/                   # See Section 5
├── workspaces/
│   ├── workspaces.module.ts
│   ├── workspaces.service.ts   # findAll, findOne, create, update, remove
│   ├── workspaces.controller.ts # GET/POST/PATCH/DELETE /workspaces
│   └── dto/
│       ├── create-workspace.dto.ts
│       └── update-workspace.dto.ts
├── projects/
│   ├── projects.module.ts
│   ├── projects.service.ts     # findAll, findOne, create, update, remove
│   ├── projects.controller.ts  # GET/POST/PATCH/DELETE /projects
│   └── dto/
│       ├── create-project.dto.ts
│       └── update-project.dto.ts
└── common/
    └── decorators/
        └── current-user.decorator.ts
```

### Key Concepts

#### Global Modules (PrismaModule, RedisModule)
Both decorated with `@Global()`. Available everywhere without needing to import them in each feature module. Any service can inject `PrismaService` or `RedisService` directly.

#### DTOs and Validation
DTOs define the shape of incoming request data. `class-validator` decorators validate automatically:
```typescript
export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
```
The global `ValidationPipe` in `main.ts` rejects invalid requests with `400 Bad Request` before they reach the service.

#### Ownership Checks
Every service method that accesses a resource verifies the current user owns it:
```typescript
async findOne(id: string, userId: string) {
  const workspace = await this.prisma.workspace.findUnique({ where: { id } })
  if (!workspace) throw new NotFoundException()
  if (workspace.userId !== userId) throw new ForbiddenException()
  return workspace
}
```

#### ConfigModule
Loads `.env` globally via `ConfigService`. Use `config.get<string>('JWT_SECRET')` instead of `process.env.JWT_SECRET` — safer, testable, typed.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://devflow:devflow123@127.0.0.1:5433/devflow_db"

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3

# App
PORT=3001
NODE_ENV=development
```

---

## 7. Frontend Architecture (Next.js)

The frontend uses **Next.js 15** with the App Router. Every folder under `app/` becomes a URL route automatically.

### Folder Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout — ThemeProvider + QueryProvider
│   ├── globals.css             # Tailwind + shadcn CSS variables
│   ├── login/
│   │   └── page.tsx            # Login form
│   ├── register/
│   │   └── page.tsx            # Register form
│   └── dashboard/
│       ├── layout.tsx          # Auth check + Sidebar + Header wrapper
│       ├── page.tsx            # Dashboard home — stats overview
│       ├── workspaces/
│       │   └── page.tsx        # Workspaces list + create/delete
│       ├── projects/
│       │   ├── page.tsx        # Projects list + create/delete
│       │   └── [id]/
│       │       └── page.tsx    # Project detail — tabbed layout
│       ├── notes/              # Week 4
│       └── chat/               # Week 4
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # Navigation sidebar with active states
│   │   └── header.tsx          # Top bar with page title + user avatar
│   ├── theme-provider.tsx      # next-themes wrapper
│   ├── theme-toggle.tsx        # Sun/Moon button
│   ├── loading-screen.tsx      # Full-screen loading spinner
│   └── query-provider.tsx      # React Query QueryClient wrapper
├── lib/
│   └── axios.ts                # Axios instance with request/response interceptors
├── store/
│   └── auth.store.ts           # Zustand auth state with persist middleware
├── types/
│   └── auth.ts                 # TypeScript interfaces for auth
└── middleware.ts               # Next.js edge middleware for route protection
```

### State Management

#### Zustand (`useAuthStore`)

Manages authentication state across the app:

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user, accessToken, refreshToken) => void  // called after login
  clearAuth: () => void                               // called on logout
}
```

The **`persist` middleware** saves state to `localStorage` under key `devflow-auth`. This means the user stays logged in after page refresh — Zustand rehydrates from localStorage automatically.

#### React Query (TanStack Query)

Manages all server data (data fetched from API):

```typescript
// Fetch workspaces — handles loading, caching, error states
const { data: workspaces, isLoading } = useQuery({
  queryKey: ['workspaces'],
  queryFn: () => api.get('/workspaces').then(r => r.data)
})

// Delete with optimistic update — removes from UI instantly
const deleteMutation = useMutation({
  mutationFn: (id) => api.delete(`/workspaces/${id}`),
  onMutate: async (id) => {
    // Cancel ongoing fetches
    await queryClient.cancelQueries({ queryKey: ['workspaces'] })
    // Snapshot previous state
    const previous = queryClient.getQueryData(['workspaces'])
    // Optimistically remove from UI
    queryClient.setQueryData(['workspaces'], (old) => old.filter(w => w.id !== id))
    return { previous }
  },
  onError: (_err, _id, context) => {
    // Restore if request fails
    queryClient.setQueryData(['workspaces'], context.previous)
  },
  onSettled: () => {
    // Always refetch for consistency
    queryClient.invalidateQueries({ queryKey: ['workspaces'] })
  }
})
```

### Axios Interceptors (`lib/axios.ts`)

#### Request Interceptor — Auto Token Injection
Before every API call, reads the access token from Zustand's persisted localStorage and adds it to the Authorization header automatically. No need to manually add headers anywhere.

#### Response Interceptor — Auto Refresh on 401
If any API call returns `401 Unauthorized` (access token expired):
1. Reads the refresh token from localStorage
2. Calls `POST /auth/refresh` with the refresh token
3. Updates the stored access token in localStorage and cookie
4. Retries the original failed request with the new token
5. If refresh also fails → clears all auth state → redirects to `/login`

### Route Protection

#### Next.js Middleware (`middleware.ts`)
Runs on every request **at the edge** (before the page renders). Checks for `accessToken` cookie:
- No token + protected route → redirect to `/login`
- Has token + public route (`/login`, `/register`) → redirect to `/dashboard`

#### Dashboard Layout Client-Side Check
Secondary check using Zustand `isAuthenticated`. The **`mounted` state pattern** prevents hydration mismatches:

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

// Before client hydration, show loading screen
if (!mounted) return <LoadingScreen />
// After hydration, if not authenticated, redirect
if (!isAuthenticated) return <LoadingScreen />
```

### Dark Mode

`next-themes` manages dark/light mode. `ThemeProvider` wraps the entire app with `attribute="class"`, which toggles the `dark` class on the `<html>` element. Tailwind CSS uses this to switch color schemes. User preference persists automatically in localStorage.

---

## 8. API Endpoints Reference

All endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, returns token pair |
| POST | `/auth/login` | No | Login, returns token pair |
| POST | `/auth/refresh` | Refresh Token | Get new access token |
| POST | `/auth/logout` | JWT | Blacklist refresh token in Redis |
| GET | `/auth/me` | JWT | Get current user profile |
| GET | `/workspaces` | JWT | List all user workspaces (with project count) |
| POST | `/workspaces` | JWT | Create a new workspace |
| GET | `/workspaces/:id` | JWT | Get workspace with its projects |
| PATCH | `/workspaces/:id` | JWT | Update workspace name/description |
| DELETE | `/workspaces/:id` | JWT | Delete workspace + all projects (cascade) |
| GET | `/projects` | JWT | List projects (optional `?workspaceId=` filter) |
| POST | `/projects` | JWT | Create project in a workspace |
| GET | `/projects/:id` | JWT | Get project with its notes |
| PATCH | `/projects/:id` | JWT | Update project details/status |
| DELETE | `/projects/:id` | JWT | Delete project + its notes (cascade) |

### Test with PowerShell

```powershell
# Login and store token
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3001/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"test@test.com","password":"password123"}'
$token = $response.accessToken

# Call protected endpoint
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:3001/auth/me" `
  -Headers @{Authorization = "Bearer $token"}
```

---

## 9. Week-by-Week Build Log

### Week 1: Foundation (Days 1-10)
**Goal: Everything running locally. No features yet, just solid infrastructure.**

| Day | Focus | What We Built & Why |
|-----|-------|---------------------|
| 1 | Monorepo setup | Created GitHub repo, folder structure (`apps/web`, `apps/backend`, `apps/mobile`, `packages/shared`), initialized git, first commit on `develop` branch |
| 2 | Next.js | `npx create-next-app` with TypeScript, Tailwind, App Router. Installed `shadcn/ui` with Radix + Nova preset — gives us accessible, styled components out of the box |
| 3 | NestJS | `nest new apps/backend`. Removed nested `.git` folder (NestJS auto-creates git, conflicts with root). Installed `@nestjs/jwt`, `passport`, `bcrypt` packages |
| 4 | React Native | `npx @react-native-community/cli init DevFlowMobile` — TypeScript is now default in RN 0.71+, no `--template` flag needed |
| 5 | Docker | Installed WSL 2 to enable Docker Desktop on Windows. `docker-compose.yml` with pgvector/postgres, redis:alpine, ollama/ollama. Fixed port to `5433` to avoid local PostgreSQL conflict |
| 6 | Prisma | `npx prisma init`. Wrote complete schema with 6 models. Fixed Prisma 7 breaking change — `prisma.config.ts` required instead of `url` in schema. Ran first migration. Verified in Prisma Studio |
| 7 | Seed + Linting | `prisma/seed.ts` with test user, workspace, project, note. Prettier configured (single quotes, trailing commas). Husky pre-commit hook runs ESLint before every commit |
| 8 | Env config | `@nestjs/config` installed. `ConfigModule` set globally. `.env` and `.env.example` created with all required variables |
| 9 | CI Pipeline | `.github/workflows/ci.yml` — runs ESLint + build for both backend and frontend on every push to `main` or `develop` |
| 10 | Documentation | Complete README with setup instructions, tech stack table, and development roadmap. `CONTRIBUTING.md` with branching strategy and commit conventions |

---

### Week 2: Authentication (Days 11-20)
**Goal: Complete auth working end-to-end — register, login, JWT, refresh tokens, frontend forms.**

| Day | Focus | What We Built & Why |
|-----|-------|---------------------|
| 11 | Auth backend | `PrismaModule` (global), `AuthModule` with register + login. `class-validator` DTOs. Global `ValidationPipe` in `main.ts` — auto-validates all incoming requests |
| 12 | JWT strategy + guards | `JwtStrategy` (passport-jwt) validates tokens from Authorization header. `JwtAuthGuard` wraps it. `@CurrentUser()` decorator extracts user cleanly. Tested with PowerShell `Invoke-RestMethod` |
| 13 | Refresh tokens + Redis | `RedisModule` (global) with `ioredis`. `JwtRefreshStrategy` reads token from request body. `/auth/refresh` and `/auth/logout` endpoints. Logout blacklists token in Redis with 7-day TTL |
| 14 | Auth tests | Unit tests for `AuthService`: register success, duplicate email (409), login success, wrong password (401), user not found (401), logout blacklisting. Fixed boilerplate tests for RedisService and AuthController |
| 15 | Login page | Login form with `react-hook-form` + Zod validation. Axios instance with interceptors. Zustand `useAuthStore` with `persist` middleware. `.env.local` with API URL |
| 16 | Register page | Register form with `confirmPassword` cross-field Zod validation. Error handling for existing email. Redirects to `/dashboard` on success |
| 17 | Auth store + middleware | Enhanced Zustand store with `isAuthenticated` flag. Next.js `middleware.ts` for edge-level route protection using `accessToken` cookie |
| 18 | Axios interceptors | Upgraded to read token from Zustand-persisted localStorage. Auto-refresh on 401 updates localStorage + cookie. Full logout clears all state and redirects |
| 19 | Dashboard shell | Dashboard layout with Sidebar + main content area. Dashboard home page with stats grid. Fixed logout blank page — clear cookie first, then state, then redirect |
| 20 | Auth polish | `LoadingScreen` component. Fixed hydration mismatch with `mounted` state pattern in dashboard layout |

---

### Week 3: Dashboard & Projects (Days 21-30)
**Goal: Real working CRUD features for workspaces and projects with polished UI.**

| Day | Focus | What We Built & Why |
|-----|-------|---------------------|
| 21 | Sidebar | Refactored into reusable component with `lucide-react` icons. Active state highlighting with `usePathname()`. User info + logout at bottom |
| 22 | Dark mode | `next-themes` installed. `ThemeProvider` wraps entire app. `ThemeToggle` button in sidebar. User preference persists automatically |
| 23 | Header | Top bar with current page title (mapped from pathname), user email, and avatar with initials. Responsive — email hidden on mobile |
| 24 | Workspaces backend | `WorkspacesModule` with full CRUD. `findAll` is user-scoped. Ownership checks in `findOne`. Returns project count in list response |
| 25 | Workspaces frontend | `@tanstack/react-query` installed. `QueryProvider` created. Workspaces page with loading skeletons, empty state, card grid, create modal, delete button |
| 26 | Projects backend | `ProjectsModule` with full CRUD. Workspace ownership verified before creating a project. `?workspaceId` query filter support. Returns note count |
| 27 | Projects frontend | Projects page with workspace selector in create modal. Status color badges. Clickable cards navigate to detail page via `useRouter` |
| 28 | Project detail | Dynamic route `[id]/page.tsx`. Tabbed layout: Overview (stats), Notes (list), AI Chat (placeholder). Loading skeleton while data fetches |
| 29 | Optimistic updates | Delete mutations use `onMutate` to remove items from UI instantly. `onError` restores previous state if request fails. `onSettled` always refetches |
| 30 | Week wrap-up | Pushed `develop` branch, merged to `main`. Full auth-to-dashboard flow working end-to-end |

---

## 10. Issues Encountered & Fixes

| Issue | Root Cause | Fix Applied |
|---|---|---|
| `mkdir -p` failed in PowerShell | Windows uses different syntax than Linux/Mac | Used `mkdir apps\web, apps\backend` instead |
| `git add` failed with nested `.git` | NestJS CLI auto-initializes git inside the project | `Remove-Item -Recurse -Force apps\backend\.git` |
| Docker Desktop stuck on "Starting Engine" | WSL 2 not installed on Windows | `wsl --install` as Administrator, then restart PC |
| Prisma `migrate dev` failed with P1012 error | Prisma 7 removed `url` property from `schema.prisma` | Created `prisma.config.ts` with `datasource.url` loaded via `dotenv` |
| Port conflict on 5432 | Local PostgreSQL occupied default port | Changed Docker mapping to `5433:5432`, updated `DATABASE_URL` |
| JWT TypeScript strict errors | `config.get()` returns `string \| undefined` | Added generic + assertion: `config.get<string>('KEY')!` |
| Dashboard blank page on logout | `clearAuth()` and `router.push()` raced | Clear cookie first → `clearAuth()` → then `router.push('/login')` |
| Next.js hydration mismatch | Zustand state differs between server and client | Added `mounted` state — show `LoadingScreen` until client hydrates |
| Turbopack error with multiple lockfiles | Monorepo has lockfiles in root and `apps/web` | Added `turbopack: { root: __dirname }` to `next.config.ts` |
| `curl` syntax fails in PowerShell | PowerShell `curl` is `Invoke-WebRequest`, not real curl | Used `Invoke-RestMethod` with proper PowerShell syntax |

---

## 11. What Comes Next

### Week 4: Notes System (Days 31-40)
- Notes CRUD backend with full-text search using PostgreSQL `tsvector`
- Note versioning — save history on every update
- Rich markdown editor (`react-md-editor`) with live preview
- Auto-save with debounce — saves while you type
- Tag filtering and search bar

### Week 5-6: AI Core (Days 41-50)
- Connect NestJS to Ollama HTTP API
- Build streaming chat with SSE (Server-Sent Events) for token-by-token output
- Conversation history stored in PostgreSQL
- Model selector (switch between llama3, mistral, codellama)
- Code syntax highlighting in chat responses

### Week 7-8: AI Tools + RAG (Days 51-60)
- Code analysis endpoint — explain code line by line
- Debugging assistant — paste error, get structured fix suggestions
- Documentation generator — select function, get JSDoc
- RAG pipeline — embed notes/code with pgvector, ask questions about your codebase

### Week 9-10: GitHub Integration (Days 61-70)
- Connect GitHub repo to a project
- Fetch file tree and README from GitHub API
- Background job (BullMQ) to index repo files into pgvector
- WebSocket progress updates during indexing

### Week 11-12: Mobile App (Days 71-80)
- React Native screens: login, register, workspaces, projects, notes, AI chat
- SSE streaming in React Native for AI chat
- Loading states and error handling

### Week 13-14: Deployment (Days 81-90)
- Neon DB (hosted PostgreSQL), Railway (backend), Vercel (frontend)
- Oracle Free VM for Ollama
- GitHub Actions deploy pipeline on push to `main`
- Portfolio launch — README, Loom demo video, LinkedIn post

---

*DevFlow AI — Built by developers, for developers.*  
*Documentation v1.0 — Weeks 1-3 — June 2026*
