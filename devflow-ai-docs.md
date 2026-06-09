# DevFlow AI — Complete Architecture Documentation & Implementation Plan

> **Version:** 1.0.0 | **Author:** Architecture Team | **Status:** Production Blueprint  
> **Stack:** Next.js · NestJS · Flutter · PostgreSQL · Redis · Ollama · Docker

---

## Table of Contents

1. [Phase 1 — Product Definition](#phase-1-product-definition)
2. [Phase 2 — Feature Breakdown](#phase-2-feature-breakdown)
3. [Phase 3 — System Architecture](#phase-3-complete-system-architecture)
4. [Phase 4 — Monolith vs Microservices Decision](#phase-4-architectural-decision)
5. [Phase 5 — Backend Design](#phase-5-backend-design)
6. [Phase 6 — Database Design](#phase-6-database-design)
7. [Phase 7 — API Design](#phase-7-api-design)
8. [Phase 8 — AI Architecture](#phase-8-ai-architecture)
9. [Phase 9 — Frontend Architecture](#phase-9-frontend-architecture)
10. [Phase 10 — Mobile Architecture](#phase-10-mobile-architecture)
11. [Phase 11 — Security Design](#phase-11-security-design)
12. [Phase 12 — Deployment Architecture](#phase-12-deployment-architecture)
13. [Phase 13 — Testing Strategy](#phase-13-testing-strategy)
14. [Phase 14 — 20-Phase Implementation Roadmap](#phase-14-20-phase-implementation-roadmap)
15. [Phase 15 — Git Strategy](#phase-15-git-strategy)
16. [Phase 16 — Coding Standards](#phase-16-coding-standards)
17. [Phase 17 — AI Coding Workflow](#phase-17-ai-coding-workflow)
18. [Phase 18 — Portfolio Presentation](#phase-18-portfolio-presentation)
19. [Phase 19 — Future Improvements](#phase-19-future-improvements)
20. [Phase 20 — Day-by-Day Execution Plan](#phase-20-day-by-day-execution-plan)

---

# PHASE 1: PRODUCT DEFINITION

## 1. Product Vision

DevFlow AI is a unified, AI-powered developer workspace that eliminates context-switching by bringing project planning, code understanding, intelligent debugging, automated documentation, and persistent developer notes into a single cohesive platform. Powered by locally-running open-source LLMs via Ollama, it gives every developer — whether indie hacker, student, or professional — access to a private, cost-free AI coding companion that respects data sovereignty.

**Vision Statement:**  
*"One workspace. Every developer workflow. Zero cloud dependency for AI."*

---

## 2. Problem Statement

Modern developers suffer from severe workflow fragmentation:

| Pain Point | Current Reality |
|---|---|
| Project planning | Scattered across Notion, Jira, sticky notes |
| Code understanding | Manually reading, no inline AI in personal workspace |
| Debugging | Trial and error, StackOverflow rabbit holes |
| Documentation | Perpetually postponed, never written |
| Developer notes | Spread across 5 different apps |
| AI tools | Expensive ($20+/month), privacy concerns with cloud |
| Mobile access | No unified mobile dev workspace exists |

No single tool addresses all of these together. ChatGPT and GitHub Copilot are powerful but expensive, require internet, and send your private code to external servers.

---

## 3. Target Users

**Primary:**
- Computer Science students and fresh graduates building portfolios
- Junior to mid-level software developers
- Freelance developers managing multiple client projects
- Solo indie hackers building side projects

**Secondary:**
- Development bootcamp students
- Senior developers wanting a private AI workspace
- Small dev teams (2–5 people) needing lightweight project management

---

## 4. User Personas

### Persona 1 — Amir, the Fresh Graduate
- **Age:** 22 | **Role:** CS Graduate / Job Seeker
- **Goal:** Build a strong portfolio project, learn modern tech
- **Pain:** Can't afford Copilot, needs a tool to practice with
- **Uses DevFlow For:** AI code explanations, project planning, portfolio notes

### Persona 2 — Sara, the Freelance Developer
- **Age:** 28 | **Role:** Full-Stack Freelancer
- **Goal:** Manage 3 client projects simultaneously
- **Pain:** Context-switching between tools is killing productivity
- **Uses DevFlow For:** Project workspaces, documentation generator, notes

### Persona 3 — Raza, the Indie Hacker
- **Age:** 31 | **Role:** Solo SaaS Builder
- **Goal:** Ship fast with minimal overhead
- **Pain:** Debugging alone at 2AM with no help
- **Uses DevFlow For:** AI debugging assistant, code analysis, GitHub integration

### Persona 4 — Zara, the Bootcamp Student
- **Age:** 20 | **Role:** Web Dev Bootcamp Student
- **Goal:** Understand code concepts quickly
- **Pain:** Confused by errors, hard to self-teach
- **Uses DevFlow For:** AI explanations, note-taking, project tracking

---

## 5. Main Use Cases

1. **UC-01:** User creates a project workspace, adds GitHub repo, and tracks progress
2. **UC-02:** User pastes code snippet, AI explains it line by line
3. **UC-03:** User pastes an error, AI debugging assistant suggests fixes
4. **UC-04:** User selects a function, AI generates JSDoc/docstring documentation
5. **UC-05:** User stores development notes organized by project
6. **UC-06:** User chats with AI assistant with full conversation history
7. **UC-07:** User switches AI models (Llama3, Mistral, CodeLlama) per task
8. **UC-08:** User accesses workspace from mobile (Flutter app)
9. **UC-09:** User uses RAG to ask questions about their own codebase
10. **UC-10:** User exports documentation as Markdown or PDF

---

## 6. Unique Selling Points

| USP | Description |
|---|---|
| **100% Free AI** | Runs on local Ollama models — no API costs |
| **Privacy First** | Code never leaves your machine |
| **Multi-Model** | Switch between Llama3, Mistral, CodeLlama |
| **RAG on Your Code** | Ask questions about your own codebase |
| **Web + Mobile** | Full-featured Flutter mobile app |
| **Developer-Specific** | Built for developers, not generic productivity |
| **Offline Capable** | Works without internet after initial setup |
| **Open Source Ready** | Fully self-hostable architecture |

---

## 7. MVP Scope

The MVP focuses on the core loop: **Create Project → Add Code/Notes → Chat with AI → Export**

**MVP Includes:**
- User authentication (email + JWT)
- Workspace and project management (CRUD)
- Developer notes with rich text (Markdown)
- AI chat assistant (single conversation)
- Code explanation feature
- Basic debugging assistant
- Single AI model support (Llama 3)
- Web frontend only (Flutter in Phase 2)
- Docker Compose local setup

**MVP Excludes (Post-MVP):**
- GitHub OAuth integration
- RAG pipeline
- Multiple AI models
- Documentation generator
- Mobile app
- AI agents
- Team collaboration

---

## 8. Future Expansion Ideas

1. **Team workspaces** with role-based access control
2. **AI code generation** — describe feature → get code
3. **VS Code Extension** integrating DevFlow AI inline
4. **Browser Extension** for StackOverflow/GitHub AI overlays
5. **Voice input** for AI assistant
6. **Custom model fine-tuning** on user's own codebase
7. **Project analytics** — time tracking, commit frequency
8. **Marketplace** for prompt templates
9. **Self-hosted cloud** — deploy on own VPS
10. **Enterprise tier** with SSO and audit logs

---

# PHASE 2: FEATURE BREAKDOWN

## Feature 1 — Authentication

**Purpose:** Securely identify users and protect all resources with JWT-based stateless auth.

**User Flow:**
```
Register → Email + Password → JWT issued → Access protected routes
Login → Credentials → Access Token (15min) + Refresh Token (7d)
Refresh → Expired token → New access token via refresh endpoint
Logout → Refresh token revoked in Redis
```

**Backend Requirements:**
- `POST /auth/register` — hash password (bcrypt), create user, issue tokens
- `POST /auth/login` — verify credentials, issue token pair
- `POST /auth/refresh` — validate refresh token, issue new access token
- `POST /auth/logout` — blacklist refresh token in Redis
- JWT Guard applied globally via NestJS middleware
- Refresh tokens stored in Redis with TTL

**Frontend Requirements:**
- Register and Login pages with form validation (Zod)
- Token stored in `httpOnly` cookie (preferred) or memory (not localStorage)
- Axios interceptor for automatic token refresh on 401
- Protected route HOC / middleware in Next.js App Router

**Database Impact:**
- `users` table: id, email, password_hash, created_at
- `sessions` table: refresh_token_hash, user_id, expires_at, is_revoked

---

## Feature 2 — User Profile

**Purpose:** Store user preferences, avatar, display name, and AI model preferences.

**User Flow:**
```
After login → Profile page → Edit name/bio/avatar
Settings → Choose default AI model → Saved per user
```

**Backend Requirements:**
- `GET /users/me` — return own profile
- `PATCH /users/me` — update profile fields
- `POST /users/me/avatar` — upload avatar (Multer → local/S3)
- Profile includes: name, bio, avatar_url, default_ai_model

**Frontend Requirements:**
- Profile settings page under `/settings/profile`
- Avatar upload with preview
- AI model selector (dropdown of available Ollama models)

**Database Impact:**
- `users` table extended: display_name, bio, avatar_url, default_ai_model, updated_at

---

## Feature 3 — Workspace

**Purpose:** Top-level organizational unit — one user can have multiple workspaces (e.g., "Client Projects", "Personal", "Learning").

**User Flow:**
```
Dashboard → Create Workspace → Name + Description + Color
Workspace → Contains multiple Projects
Switch between workspaces via sidebar
```

**Backend Requirements:**
- Full CRUD for workspaces
- Workspace is scoped to a single user (solo MVP)
- Validation: max 10 workspaces per user (MVP limit)

**Frontend Requirements:**
- Sidebar with workspace switcher
- Create workspace modal
- Workspace settings page

**Database Impact:**
- `workspaces` table: id, user_id, name, description, color, icon, created_at

---

## Feature 4 — Projects

**Purpose:** Container for all work items — notes, code files, AI conversations — scoped within a workspace.

**User Flow:**
```
Workspace → Create Project → Title + Description + Tags
Project Detail → 4 tabs: Notes | Files | AI Chat | GitHub
```

**Backend Requirements:**
- CRUD for projects under workspace
- Project status: active / archived / completed
- Tags support (array field)
- File attachment support (later phase)

**Frontend Requirements:**
- Project card grid on workspace page
- Project detail with tabbed interface
- Status badge, progress indicator (manual)

**Database Impact:**
- `projects` table: id, workspace_id, name, description, status, tags[], created_at

---

## Feature 5 — Notes

**Purpose:** Developer-focused note taking with Markdown support, code blocks, and AI-assisted writing.

**User Flow:**
```
Project → Notes Tab → Create Note → Markdown Editor
Notes list → Search by title/content → Open → Edit/Delete
AI Button → Summarize / Improve / Explain this note
```

**Backend Requirements:**
- CRUD for notes scoped to project
- Full-text search on title and content (PostgreSQL `tsvector`)
- Note versioning (store previous 5 versions)
- Embedding generation on save (for RAG)

**Frontend Requirements:**
- `@uiw/react-md-editor` or custom CodeMirror-based Markdown editor
- Live preview toggle
- Search bar with debounced query
- Note tags for organization

**Database Impact:**
- `notes` table: id, project_id, title, content, tags[], version, search_vector (tsvector), created_at, updated_at

---

## Feature 6 — AI Assistant

**Purpose:** Conversational AI chat interface backed by local Ollama LLMs. Context-aware per project.

**User Flow:**
```
Project → AI Chat Tab → Select Model → Type message → Stream response
Chat history persisted → Reload page → History still there
System prompt includes project context
New conversation → Reset context button
```

**Backend Requirements:**
- `POST /ai/chat` — send message, stream response via SSE
- Conversation stored in DB with all messages
- Context window management (trim oldest messages if > 4096 tokens)
- System prompt injection with project metadata
- Model selection per request

**Frontend Requirements:**
- Chat UI with streaming token display (SSE → word-by-word)
- Code blocks with syntax highlighting in responses
- Copy button on code blocks
- Model selector in chat header
- Loading state with typing indicator

**Database Impact:**
- `conversations` table: id, project_id, model_used, system_prompt, created_at
- `messages` table: id, conversation_id, role (user/assistant), content, tokens_used, created_at

---

## Feature 7 — Code Analysis

**Purpose:** Paste any code snippet and get a detailed AI explanation: what it does, complexity, potential issues.

**User Flow:**
```
Sidebar → Code Analysis → Paste code → Select language → Analyze
AI returns: Summary, Line-by-line explanation, Complexity, Suggestions
Results can be saved as a Note
```

**Backend Requirements:**
- `POST /ai/analyze-code` — structured prompt with code + language
- Response structured as JSON with sections
- Rate limited: 10 requests per minute per user

**Frontend Requirements:**
- Code input with syntax highlighting (CodeMirror)
- Language selector dropdown
- Structured results view (accordion sections)
- "Save as Note" button

**Database Impact:**
- Logged in `ai_requests` table: user_id, type='code_analysis', input_hash, model, tokens_used, created_at

---

## Feature 8 — Debugging Assistant

**Purpose:** Paste an error message + code context → receive structured debugging guidance.

**User Flow:**
```
Sidebar → Debug → Paste error → Paste surrounding code → Submit
AI returns: Error diagnosis, Root cause, Fix suggestions (1-3 options), Prevention tips
```

**Backend Requirements:**
- `POST /ai/debug` — structured system prompt engineered for debugging
- Returns structured JSON response with diagnosis + fixes
- Optionally web-search via Tavily (free tier) for error context

**Frontend Requirements:**
- Two-panel input: error message + code context
- Structured output with tabs: Diagnosis | Fixes | Prevention
- "Apply Fix" copies suggested fix to clipboard

**Database Impact:**
- Logged in `ai_requests` table with type='debug'

---

## Feature 9 — Documentation Generator

**Purpose:** Select a function/class and auto-generate JSDoc, Python docstrings, or README sections.

**User Flow:**
```
Code Analysis → Documentation Tab → Paste function → Choose doc style → Generate
Preview Markdown output → Copy or Save as Note or Export as .md file
```

**Backend Requirements:**
- `POST /ai/generate-docs` — prompt engineered for documentation style
- Supports: JSDoc, TSDoc, Python docstrings, README sections
- Output is valid Markdown

**Frontend Requirements:**
- Input panel + output preview in split view
- Doc style selector (JSDoc / Python / README)
- One-click copy to clipboard
- Export as `.md` file button

**Database Impact:**
- Logged in `ai_requests` table with type='doc_generation'

---

## Feature 10 — GitHub Integration

**Purpose:** Connect GitHub repos to projects, view repo metadata, browse files, and use code for RAG.

**User Flow:**
```
Project → GitHub Tab → Connect → Paste GitHub URL (public repos, no OAuth needed for MVP)
Repo metadata fetched via GitHub API (public, no auth) → Display README, file tree
"Index Repo for AI" → Embeddings generated from code files → RAG enabled
```

**Backend Requirements:**
- `POST /github/connect` — save repo URL, fetch metadata via GitHub REST API
- `POST /github/index` — clone or fetch repo files, chunk, embed, store in pgvector
- `GET /github/repos/:id` — return repo metadata
- GitHub public API: 60 req/hour unauthenticated, 5000 with token

**Frontend Requirements:**
- GitHub tab in project detail
- Repo info card (stars, language, last commit)
- File tree browser
- Indexing progress indicator (WebSocket progress)

**Database Impact:**
- `github_repos` table: id, project_id, repo_url, owner, name, default_branch, last_indexed_at
- Embeddings stored in `embeddings` table linked to repo

---

## Feature 11 — AI Agents (Post-MVP)

**Purpose:** Autonomous multi-step AI tasks: "Plan this project", "Review all my notes and find gaps", "Generate full README for this project".

**User Flow:**
```
Agent Panel → Select Agent Type → Provide goal → Agent executes multi-step task
Progress shown step by step → Final output delivered as Note or Chat message
```

**Backend Requirements:**
- Agent runner using BullMQ (background jobs)
- Tools: search notes, read project files, generate text, save result
- LangChain.js or custom tool-call loop with Ollama

**Frontend Requirements:**
- Agent panel with task history
- Step-by-step progress display
- Approve/reject steps (human-in-the-loop mode)

**Database Impact:**
- `agent_runs` table: id, user_id, agent_type, status, steps_json, result, created_at

---

# PHASE 3: COMPLETE SYSTEM ARCHITECTURE

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │   Next.js Web App   │    │     Flutter Mobile App       │   │
│  │  (App Router + TS)  │    │     (iOS + Android)          │   │
│  └──────────┬──────────┘    └──────────────┬───────────────┘   │
└─────────────┼─────────────────────────────┼───────────────────┘
              │ HTTPS/WSS                    │ HTTPS/WSS
┌─────────────▼─────────────────────────────▼───────────────────┐
│                        API GATEWAY LAYER                         │
│              NestJS Monolith (REST + WebSockets)                │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐ │
│  │  Auth    │  User    │ Project  │   AI     │   GitHub     │ │
│  │ Module   │ Module   │ Module   │ Module   │   Module     │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼──────┐    ┌──────────▼────────┐   ┌────────▼───────┐
│  PostgreSQL  │    │      Redis        │   │    Ollama      │
│  + pgvector  │    │  (Cache + Queue)  │   │  (Local LLMs)  │
│  (Primary DB)│    │                   │   │  Llama3/Mistral│
└──────────────┘    └───────────────────┘   └────────────────┘
```

---

## Component Diagram Description

**Client Layer:**
- Next.js handles web UI with SSR for SEO-sensitive pages and CSR for app pages
- Flutter handles cross-platform mobile with shared service layer

**API Layer (NestJS Monolith):**
- Single process, modular by feature domain
- Guards: JwtAuthGuard, RolesGuard applied at controller level
- Interceptors: LoggingInterceptor, TransformInterceptor for consistent responses
- Pipes: ValidationPipe with class-validator DTOs
- WebSocket Gateway for real-time AI streaming

**Data Layer:**
- PostgreSQL: all persistent relational data + vector embeddings via pgvector
- Redis: session blacklist, rate limiting counters, BullMQ job queues, response caching

**AI Layer:**
- Ollama: local HTTP server exposing `/api/generate` and `/api/embeddings`
- Runs on same machine as backend in development
- Separate container in Docker Compose

---

## Frontend Architecture

```
app/ (Next.js App Router)
├── (auth)/          ← Auth group: login, register
├── (dashboard)/     ← Protected group: workspace, projects, AI tools
│   ├── layout.tsx   ← Sidebar + header shell
│   ├── page.tsx     ← Dashboard home
│   ├── workspace/[id]/
│   ├── project/[id]/
│   └── tools/       ← Code analysis, debug, docs
└── api/             ← Next.js API routes (BFF proxy if needed)
```

---

## Backend Architecture

```
src/ (NestJS)
├── main.ts
├── app.module.ts
├── common/          ← Guards, interceptors, pipes, filters
├── config/          ← Environment config (ConfigModule)
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workspaces/
│   ├── projects/
│   ├── notes/
│   ├── ai/
│   ├── github/
│   └── notifications/
└── database/        ← Prisma schema, migrations, seeds
```

---

## AI Service Architecture

```
AI Request Flow:
User Input
    │
    ▼
AI Module (NestJS)
    │
    ├── Context Builder
    │   ├── Fetch conversation history
    │   ├── Fetch project metadata
    │   └── RAG: vector search for relevant context
    │
    ├── Prompt Builder
    │   ├── System prompt (role + task)
    │   ├── Context injection
    │   └── User message
    │
    ▼
Ollama HTTP Client (localhost:11434)
    │
    ▼
Stream Response (SSE)
    │
    ├── Save to messages table
    └── Return to client via SSE
```

---

## Database Architecture

PostgreSQL with these extension:
- `pgvector` — vector similarity search for RAG
- `pg_trgm` — fuzzy text search for notes
- `uuid-ossp` — UUID generation

All tables use UUID primary keys. Soft-delete pattern with `deleted_at` nullable timestamp.

---

## Communication Flow

**Standard REST Request:**
```
Client → HTTPS Request → NestJS Controller → Guard (JWT) → Service → Repository (Prisma) → PostgreSQL → Response
```

**AI Streaming Request:**
```
Client → POST /ai/chat → NestJS AI Module → Context Builder → Ollama HTTP Stream → SSE chunks → Client renders token by token
```

**Background Job:**
```
API Request (index repo) → BullMQ Queue → Worker Process → Chunk code files → Ollama Embeddings → pgvector INSERT → WebSocket progress notification
```

**WebSocket (Notifications):**
```
Client → WS connect → Auth handshake → Subscribe to user room → Server emits events on job completion
```

---

# PHASE 4: ARCHITECTURAL DECISION

## Decision: Modular Monolith

### Analysis Matrix

| Criteria | Microservices | Modular Monolith | Winner |
|---|---|---|---|
| Solo developer complexity | Very High | Low | Monolith |
| Deployment complexity | Very High | Low | Monolith |
| Development speed | Slow | Fast | Monolith |
| Operational overhead | Very High | Minimal | Monolith |
| Scalability (MVP stage) | Overkill | Sufficient | Monolith |
| Debugging difficulty | Very Hard | Easy | Monolith |
| Inter-service communication | Complex | Simple fn call | Monolith |
| Infrastructure cost ($0) | Expensive | Free | Monolith |

### Decision: Modular Monolith ✅

**Reasoning:**  
For a solo developer with a $0 budget building a portfolio application, microservices introduce massive operational overhead with zero tangible benefit at this scale. A **modular monolith** gives you clean domain boundaries (each NestJS module is self-contained) while allowing you to extract individual modules into microservices later if scale demands it.

**Key Principle:** Module independence is enforced at the code level — no module directly imports another module's repository. Communication between modules happens only via exported services or events. This ensures the monolith can be split later with minimal refactoring.

**Future Path:** If the project grows, extract the AI Module first (it's the most compute-heavy) into a standalone Python/FastAPI service, then GitHub integration as a separate worker.

---

# PHASE 5: BACKEND DESIGN

## Module Structure Overview

```
src/modules/
├── auth/
├── users/
├── workspaces/
├── projects/
├── notes/
├── ai/
├── github/
└── notifications/
```

---

## Auth Module

**Responsibilities:** Registration, login, JWT issuance, refresh token rotation, logout

**Controllers:** `AuthController`
```typescript
POST /auth/register     → AuthController.register()
POST /auth/login        → AuthController.login()
POST /auth/refresh      → AuthController.refresh()
POST /auth/logout       → AuthController.logout()
GET  /auth/me           → AuthController.getMe()
```

**Services:** `AuthService`
- `register(dto)` — validate email uniqueness, hash password, create user, issue tokens
- `login(dto)` — verify credentials, issue token pair
- `refresh(token)` — validate against Redis, issue new token pair, rotate refresh token
- `logout(token)` — add refresh token to Redis blacklist

**Repositories:** `UserRepository` (via Prisma — no separate class needed, service calls Prisma directly)

**DTOs:**
```typescript
RegisterDto:  { email: string, password: string, displayName: string }
LoginDto:     { email: string, password: string }
RefreshDto:   { refreshToken: string }
```

**Guards:** `JwtAuthGuard` (extends `AuthGuard('jwt')`) applied globally except auth routes

---

## User Module

**Responsibilities:** Profile management, preferences, avatar upload

**Controllers:** `UsersController`
```typescript
GET    /users/me              → getProfile()
PATCH  /users/me              → updateProfile()
POST   /users/me/avatar       → uploadAvatar()
DELETE /users/me              → deleteAccount()
GET    /users/me/stats        → getStats()
```

**Services:** `UsersService`
- `getProfile(userId)` — return user with workspace count, project count
- `updateProfile(userId, dto)` — update display name, bio, default_ai_model
- `uploadAvatar(userId, file)` — save file locally, update avatar_url
- `getStats(userId)` — aggregate: notes count, AI requests today, projects active

**DTOs:**
```typescript
UpdateProfileDto: { displayName?: string, bio?: string, defaultAiModel?: string }
```

---

## Workspace Module

**Responsibilities:** CRUD for workspaces, user-scoped

**Controllers:** `WorkspacesController`
```typescript
GET    /workspaces           → list all user workspaces
POST   /workspaces           → create workspace
GET    /workspaces/:id       → get single workspace with project count
PATCH  /workspaces/:id       → update name/description/color
DELETE /workspaces/:id       → soft delete
```

**Services:** `WorkspacesService`
- Enforce max 10 workspaces per user
- Validate user owns workspace (ownership guard)
- On delete: cascade soft-delete projects

**DTOs:**
```typescript
CreateWorkspaceDto: { name: string, description?: string, color?: string, icon?: string }
UpdateWorkspaceDto: Partial<CreateWorkspaceDto>
```

---

## Project Module

**Responsibilities:** CRUD for projects, status management, search

**Controllers:** `ProjectsController`
```typescript
GET    /workspaces/:wid/projects       → list projects in workspace
POST   /workspaces/:wid/projects       → create project
GET    /projects/:id                   → get project detail
PATCH  /projects/:id                   → update project
DELETE /projects/:id                   → soft delete
GET    /projects/search?q=             → search across user's projects
```

**Services:** `ProjectsService`
- Full-text search using PostgreSQL `to_tsvector` + `to_tsquery`
- Tags CRUD (stored as string array)
- Project statistics: note count, file count, conversation count

**DTOs:**
```typescript
CreateProjectDto: { name: string, description?: string, tags?: string[], status?: ProjectStatus }
ProjectStatus enum: ACTIVE | ARCHIVED | COMPLETED
```

---

## AI Module

**Responsibilities:** All LLM communication, prompt management, streaming, RAG

**Controllers:** `AiController`
```typescript
POST /ai/chat              → chat with streaming (SSE)
POST /ai/analyze-code      → code explanation
POST /ai/debug             → debugging assistant
POST /ai/generate-docs     → documentation generator
GET  /ai/models            → list available Ollama models
POST /ai/conversations     → create new conversation
GET  /ai/conversations/:id → get conversation with messages
```

**Services:**
- `AiService` — main orchestrator
- `OllamaClient` — HTTP client for Ollama API
- `PromptBuilder` — constructs system + user prompts
- `ContextService` — fetches conversation history, builds context window
- `EmbeddingService` — generates and stores embeddings
- `RagService` — vector search, retrieve relevant context

**Internal Flow:**
```
AiController.chat(dto)
  → ContextService.buildContext(conversationId)     [history + RAG]
  → PromptBuilder.buildChatPrompt(context, message) [system + messages]
  → OllamaClient.streamGenerate(prompt, model)      [SSE stream]
  → MessageRepository.save(role, content, tokens)   [persist]
  → return SSE stream to controller
```

---

## GitHub Module

**Responsibilities:** GitHub repo connection, metadata fetch, repo indexing for RAG

**Controllers:** `GithubController`
```typescript
POST /github/connect       → connect repo to project
GET  /github/repos/:id     → get repo metadata
POST /github/repos/:id/index → trigger indexing job
GET  /github/repos/:id/files → browse file tree
DELETE /github/repos/:id   → disconnect repo
```

**Services:**
- `GithubService` — GitHub REST API calls
- `RepoIndexerService` — fetch files, chunk, embed, store

**Queue Job:** `RepoIndexJob` via BullMQ — runs in background, emits WebSocket progress

---

## Notification Module

**Responsibilities:** In-app notifications, WebSocket broadcasting

**Gateway:** `NotificationsGateway` (WebSocket)
```typescript
@WebSocketGateway({ namespace: '/notifications' })
```

**Events:**
```
repo-index-progress  → { repoId, percent, currentFile }
repo-index-complete  → { repoId, chunksIndexed }
agent-step           → { agentRunId, step, description }
system-notification  → { type, message }
```

**Services:** `NotificationsService`
- `sendToUser(userId, event, data)` — broadcast to user's socket room
- `createNotification(userId, title, body)` — persist to DB

---

# PHASE 6: DATABASE DESIGN

## Complete Schema

```sql
-- =============================================
-- USERS & AUTH
-- =============================================

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  display_name      VARCHAR(100),
  bio               TEXT,
  avatar_url        VARCHAR(500),
  default_ai_model  VARCHAR(100) DEFAULT 'llama3',
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);

-- =============================================

CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  ip_address        INET,
  user_agent        TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  is_revoked        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(refresh_token_hash);

-- =============================================
-- WORKSPACES & PROJECTS
-- =============================================

CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(20) DEFAULT '#6366f1',
  icon        VARCHAR(50),
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);

-- =============================================

CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  status       VARCHAR(20) DEFAULT 'active',     -- active | archived | completed
  tags         TEXT[],
  search_vector TSVECTOR,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

-- =============================================
-- NOTES
-- =============================================

CREATE TABLE notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title          VARCHAR(500) NOT NULL,
  content        TEXT NOT NULL DEFAULT '',
  tags           TEXT[],
  version        INTEGER DEFAULT 1,
  search_vector  TSVECTOR,
  word_count     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);

-- =============================================

CREATE TABLE note_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id    UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  version    INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FILES
-- =============================================

CREATE TABLE files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  path         VARCHAR(1000) NOT NULL,
  mime_type    VARCHAR(100),
  size_bytes   BIGINT,
  storage_type VARCHAR(20) DEFAULT 'local',     -- local | s3
  storage_key  VARCHAR(1000) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_files_project_id ON files(project_id);

-- =============================================
-- AI CONVERSATIONS
-- =============================================

CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(500),
  model_used    VARCHAR(100) NOT NULL,
  system_prompt TEXT,
  total_tokens  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- =============================================

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL,           -- user | assistant | system
  content         TEXT NOT NULL,
  tokens_used     INTEGER,
  model           VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- =============================================
-- AI REQUESTS LOG
-- =============================================

CREATE TABLE ai_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type    VARCHAR(50) NOT NULL,           -- chat | code_analysis | debug | doc_gen
  model           VARCHAR(100) NOT NULL,
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  duration_ms     INTEGER,
  status          VARCHAR(20) DEFAULT 'success',  -- success | error | timeout
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX idx_ai_requests_created_at ON ai_requests(created_at);

-- =============================================
-- EMBEDDINGS (RAG)
-- =============================================

-- Requires: CREATE EXTENSION vector;

CREATE TABLE embeddings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type  VARCHAR(50) NOT NULL,              -- note | file | github_file
  source_id    UUID NOT NULL,
  chunk_index  INTEGER NOT NULL,
  chunk_text   TEXT NOT NULL,
  embedding    vector(4096),                      -- Llama3 embedding dimension
  model        VARCHAR(100) NOT NULL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- =============================================
-- GITHUB
-- =============================================

CREATE TABLE github_repos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  repo_url        VARCHAR(500) NOT NULL,
  owner           VARCHAR(200) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  default_branch  VARCHAR(100) DEFAULT 'main',
  description     TEXT,
  stars_count     INTEGER DEFAULT 0,
  language        VARCHAR(100),
  is_indexed      BOOLEAN DEFAULT false,
  last_indexed_at TIMESTAMPTZ,
  index_status    VARCHAR(20),                    -- pending | running | complete | error
  chunks_indexed  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_github_repos_project_id ON github_repos(project_id);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,                -- info | success | warning | error
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
```

---

## ERD Description

```
users (1) ──────────────────── (N) sessions
users (1) ──────────────────── (N) workspaces
users (1) ──────────────────── (N) conversations
users (1) ──────────────────── (N) ai_requests
users (1) ──────────────────── (N) notifications

workspaces (1) ──────────────── (N) projects

projects (1) ──────────────────── (N) notes
projects (1) ──────────────────── (N) files
projects (1) ──────────────────── (N) conversations
projects (1) ──────────────────── (1) github_repos

notes (1) ──────────────────────── (N) note_versions

conversations (1) ───────────────── (N) messages

embeddings ─── source_type + source_id ──▶ notes | files | github_repos
```

---

# PHASE 7: API DESIGN

## Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://api.devflow.ai/api/v1
```

## Response Format (All endpoints)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": { "page": 1, "total": 25 }
}
```

## Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "details": [...]
  },
  "statusCode": 400
}
```

---

## AUTH ENDPOINTS

### Register
```
Method:         POST
URL:            /auth/register
Purpose:        Create a new user account
Authentication: None

Request Body:
{
  "email": "ahtisham@dev.com",
  "password": "SecurePass123!",
  "displayName": "Ahtisham"
}

Response 201:
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "displayName": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}

Errors: 409 (email exists), 400 (validation)
```

### Login
```
Method:         POST
URL:            /auth/login
Purpose:        Authenticate and receive tokens
Authentication: None

Request Body:
{
  "email": "ahtisham@dev.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}

Errors: 401 (invalid credentials), 400 (validation)
```

### Refresh Token
```
Method:         POST
URL:            /auth/refresh
Purpose:        Get new access token using refresh token
Authentication: None (refresh token in body)

Request Body:
{ "refreshToken": "eyJ..." }

Response 200:
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..." (rotated)
  }
}

Errors: 401 (invalid/expired refresh token)
```

### Logout
```
Method:         POST
URL:            /auth/logout
Purpose:        Invalidate refresh token
Authentication: Bearer token

Request Body:
{ "refreshToken": "eyJ..." }

Response 200:
{ "success": true, "message": "Logged out successfully" }
```

---

## USER ENDPOINTS

### Get Profile
```
Method:         GET
URL:            /users/me
Purpose:        Get current user's profile
Authentication: Bearer token

Response 200:
{
  "data": {
    "id": "uuid",
    "email": "...",
    "displayName": "Ahtisham",
    "bio": "...",
    "avatarUrl": "...",
    "defaultAiModel": "llama3",
    "stats": {
      "workspacesCount": 3,
      "projectsCount": 12,
      "notesCount": 47,
      "aiRequestsToday": 15
    }
  }
}
```

### Update Profile
```
Method:         PATCH
URL:            /users/me
Purpose:        Update profile fields
Authentication: Bearer token

Request Body:
{
  "displayName": "Ahtisham Ahmed",
  "bio": "Full-stack developer",
  "defaultAiModel": "codellama"
}

Response 200: Updated user object
```

---

## WORKSPACE ENDPOINTS

### List Workspaces
```
Method:         GET
URL:            /workspaces
Purpose:        List all user's workspaces
Authentication: Bearer token

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Client Projects",
      "color": "#6366f1",
      "projectsCount": 4
    }
  ]
}
```

### Create Workspace
```
Method:         POST
URL:            /workspaces
Authentication: Bearer token

Request Body:
{
  "name": "My Portfolio",
  "description": "Personal projects",
  "color": "#10b981",
  "icon": "code"
}

Response 201: Created workspace object
Errors: 409 (max workspaces reached)
```

---

## PROJECT ENDPOINTS

### List Projects
```
Method:         GET
URL:            /workspaces/:workspaceId/projects
Authentication: Bearer token
Query Params:   ?status=active&page=1&limit=10

Response 200:
{
  "data": [ { project objects } ],
  "meta": { "page": 1, "total": 5, "limit": 10 }
}
```

### Create Project
```
Method:         POST
URL:            /workspaces/:workspaceId/projects
Authentication: Bearer token

Request Body:
{
  "name": "DevFlow AI",
  "description": "My main SaaS project",
  "tags": ["nextjs", "nestjs", "ai"],
  "status": "active"
}

Response 201: Created project object
```

### Get Project
```
Method:         GET
URL:            /projects/:id
Authentication: Bearer token

Response 200: Full project with stats (noteCount, fileCount, conversationCount)
```

### Search Projects
```
Method:         GET
URL:            /projects/search
Authentication: Bearer token
Query Params:   ?q=devflow&limit=10

Response 200: Array of matching projects with relevance score
```

---

## NOTES ENDPOINTS

### List Notes
```
Method:         GET
URL:            /projects/:projectId/notes
Authentication: Bearer token
Query Params:   ?q=search_term&page=1&limit=20

Response 200: Paginated notes list
```

### Create Note
```
Method:         POST
URL:            /projects/:projectId/notes
Authentication: Bearer token

Request Body:
{
  "title": "Architecture decisions",
  "content": "## Why we chose PostgreSQL\n\n...",
  "tags": ["architecture", "decisions"]
}

Response 201: Created note object
```

### Update Note
```
Method:         PUT
URL:            /notes/:id
Authentication: Bearer token

Request Body: { title, content, tags }
Response 200: Updated note (previous version saved automatically)
```

---

## AI ENDPOINTS

### Chat (Streaming)
```
Method:         POST
URL:            /ai/chat
Authentication: Bearer token
Content-Type:   application/json
Accept:         text/event-stream

Request Body:
{
  "conversationId": "uuid",     (optional — omit to create new)
  "projectId": "uuid",          (optional — for context)
  "message": "Explain this code: ...",
  "model": "llama3",            (optional — uses default)
  "useRag": true                (optional — enable RAG)
}

Response: SSE Stream
data: {"token": "The ", "done": false}
data: {"token": "code ", "done": false}
data: {"token": "does...", "done": false}
data: {"conversationId": "uuid", "messageId": "uuid", "tokensUsed": 245, "done": true}
```

### Analyze Code
```
Method:         POST
URL:            /ai/analyze-code
Authentication: Bearer token

Request Body:
{
  "code": "function fibonacci(n) { ... }",
  "language": "javascript",
  "model": "codellama"
}

Response 200:
{
  "data": {
    "summary": "A recursive Fibonacci implementation",
    "explanation": [
      { "line": "1-3", "description": "..." }
    ],
    "complexity": { "time": "O(2^n)", "space": "O(n)" },
    "issues": ["No memoization", "Stack overflow for large n"],
    "suggestions": ["Add memoization", "Use iterative approach"],
    "tokensUsed": 412
  }
}
```

### Debug Assistant
```
Method:         POST
URL:            /ai/debug
Authentication: Bearer token

Request Body:
{
  "error": "TypeError: Cannot read properties of undefined (reading 'map')",
  "code": "const items = data.items.map(i => i.name)",
  "language": "javascript",
  "context": "This runs after an API call"
}

Response 200:
{
  "data": {
    "diagnosis": "data.items is undefined when the API returns an empty object",
    "rootCause": "Missing null check before accessing nested property",
    "fixes": [
      {
        "option": 1,
        "description": "Optional chaining",
        "code": "const items = data?.items?.map(i => i.name) ?? []"
      }
    ],
    "prevention": "Always validate API response shape before destructuring"
  }
}
```

### Generate Documentation
```
Method:         POST
URL:            /ai/generate-docs
Authentication: Bearer token

Request Body:
{
  "code": "async function fetchUser(id: string): Promise<User> { ... }",
  "style": "jsdoc",             // jsdoc | tsdoc | python | readme
  "language": "typescript"
}

Response 200:
{
  "data": {
    "documentation": "/**\n * Fetches a user by ID\n * @param {string} id - ...\n * @returns {Promise<User>}\n */",
    "style": "jsdoc"
  }
}
```

### List Models
```
Method:         GET
URL:            /ai/models
Authentication: Bearer token

Response 200:
{
  "data": {
    "models": [
      { "name": "llama3", "size": "8B", "available": true },
      { "name": "codellama", "size": "7B", "available": true },
      { "name": "mistral", "size": "7B", "available": false }
    ]
  }
}
```

---

## GITHUB ENDPOINTS

### Connect Repository
```
Method:         POST
URL:            /github/connect
Authentication: Bearer token

Request Body:
{
  "projectId": "uuid",
  "repoUrl": "https://github.com/username/repo"
}

Response 201: GitHub repo object with metadata
```

### Trigger Indexing
```
Method:         POST
URL:            /github/repos/:id/index
Authentication: Bearer token

Response 202:
{
  "message": "Indexing job queued",
  "jobId": "uuid"
}
```
*(Progress streamed via WebSocket: notifications/repo-index-progress)*

---

# PHASE 8: AI ARCHITECTURE

## LLM Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User sends message: "How does this auth middleware work?"       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AI Controller  │
                    │  validateInput  │
                    │  checkRateLimit │
                    └────────┬────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Context Service    │
                  │  1. fetch history   │
                  │  2. trim to 4096tok │
                  │  3. RAG lookup      │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Prompt Builder     │
                  │  system + context   │
                  │  + user message     │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │   Ollama Client     │
                  │   POST /api/chat    │
                  │   stream: true      │
                  └──────────┬──────────┘
                             │
                 ┌───────────▼──────────┐
                 │   SSE Stream         │
                 │   Token by token     │
                 │   → Client browser   │
                 └───────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Post-Stream Save   │
                  │  messages table     │
                  │  ai_requests log    │
                  └─────────────────────┘
```

---

## Prompt Engineering Strategy

### System Prompt Template (Chat)
```
You are DevFlow AI, an expert software engineering assistant embedded in a developer workspace.

CONTEXT:
- Project: {project.name}
- Description: {project.description}
- Tech Stack (inferred): {detected_stack}
- Workspace: {workspace.name}

RELEVANT KNOWLEDGE BASE:
{rag_context}      ← top 3 vector search results from user's notes/code

CONVERSATION HISTORY:
{recent_messages}  ← last 10 messages, trimmed to fit context window

INSTRUCTIONS:
1. Answer precisely and technically
2. Format code blocks with language identifiers
3. When suggesting fixes, provide complete corrected code
4. If unsure, say so clearly — never hallucinate
5. Keep responses focused and scannable with headers for long answers
```

### System Prompt Template (Code Analysis)
```
You are a senior code reviewer. Analyze the provided {language} code.

Return your analysis in this EXACT JSON structure:
{
  "summary": "one line description",
  "explanation": [{"lines": "1-5", "description": "..."}],
  "complexity": {"time": "O(...)", "space": "O(...)"},
  "issues": ["issue1", "issue2"],
  "suggestions": ["improvement1", "improvement2"]
}

RULES:
- Return ONLY valid JSON, no markdown wrapper
- Be specific about line numbers
- Prioritize critical issues first
```

### System Prompt Template (Debug)
```
You are an expert debugger. A developer has this error:

ERROR: {error_message}
LANGUAGE: {language}
CODE: {code_context}

Analyze and return JSON:
{
  "diagnosis": "clear explanation of what caused this error",
  "rootCause": "the specific line/pattern causing it",
  "fixes": [
    { "option": 1, "description": "...", "code": "corrected code" }
  ],
  "prevention": "how to avoid this class of error"
}

Return ONLY valid JSON.
```

---

## RAG Pipeline

### Embedding Generation (On Save)
```
Document (note/file) created/updated
    │
    ▼
Chunker (1000 chars with 200 char overlap)
    │
    ▼
For each chunk:
    │
    ▼
Ollama /api/embeddings (model: nomic-embed-text or llama3)
    │
    ▼
embedding: vector(4096)
    │
    ▼
INSERT INTO embeddings (source_type, source_id, chunk_index, chunk_text, embedding)
```

### RAG Retrieval (On Chat Request with useRag=true)
```
User query: "How does my auth middleware work?"
    │
    ▼
Ollama /api/embeddings → query_vector: vector(4096)
    │
    ▼
PostgreSQL:
  SELECT chunk_text, 1 - (embedding <=> query_vector) AS score
  FROM embeddings
  WHERE source_type IN ('note', 'github_file')
  ORDER BY embedding <=> query_vector
  LIMIT 5;
    │
    ▼
Top 3 chunks injected into system prompt as "RELEVANT KNOWLEDGE BASE"
```

---

## Context Management

**Problem:** Ollama models have limited context windows (4096–8192 tokens)

**Strategy:**
1. Store full conversation history in DB (unlimited)
2. For each new request, fetch last N messages
3. Estimate token count (chars / 4 as approximation)
4. Trim oldest messages until total < 3500 tokens (leave 500 for response)
5. Always keep system prompt + first message + last 5 messages minimum

```typescript
async buildContext(conversationId: string, maxTokens = 3500): Promise<Message[]> {
  const messages = await this.getConversationMessages(conversationId);
  let tokenCount = 0;
  const result = [];
  
  for (const msg of messages.reverse()) {
    const est = Math.ceil(msg.content.length / 4);
    if (tokenCount + est > maxTokens) break;
    tokenCount += est;
    result.unshift(msg);
  }
  
  return result;
}
```

---

## Conversation Memory

Each conversation maintains:
- `system_prompt` — set once at conversation creation, includes project context
- `messages` — all turns stored in DB with role + content
- Context window is rebuilt from DB on each request (stateless approach)

This is simpler and more reliable than in-memory state for a solo developer project.

---

## AI Agents (Post-MVP)

**Agent Loop Pattern:**
```
Goal: "Generate a complete README for this project"
    │
    ▼
Agent decomposes into tasks:
  1. READ: get all project notes
  2. READ: get GitHub repo metadata
  3. THINK: draft README sections
  4. WRITE: generate each section with LLM
  5. COMPILE: combine into final README
  6. SAVE: create new Note with result
    │
    ▼
BullMQ job processes each step
WebSocket broadcasts progress
Human approval at final step (optional)
```

Tools available to agent: `readNotes`, `readFiles`, `searchEmbeddings`, `generateText`, `saveNote`

---

# PHASE 9: FRONTEND ARCHITECTURE

## Folder Structure

```
app/                              ← Next.js App Router
├── (auth)/                       ← Unauthenticated layout
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/                  ← Authenticated layout
│   ├── layout.tsx                ← Sidebar + header
│   ├── page.tsx                  ← Dashboard overview
│   ├── workspaces/
│   │   ├── page.tsx              ← List workspaces
│   │   └── [id]/
│   │       ├── page.tsx          ← Workspace detail
│   │       └── settings/page.tsx
│   ├── projects/
│   │   └── [id]/
│   │       ├── page.tsx          ← Project detail (tabs)
│   │       ├── notes/
│   │       ├── ai/
│   │       └── github/
│   └── tools/
│       ├── code-analysis/page.tsx
│       ├── debug/page.tsx
│       └── docs-generator/page.tsx
├── api/                          ← Next.js API routes (optional BFF)
└── globals.css

components/
├── ui/                           ← shadcn/ui components
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── MobileNav.tsx
├── workspace/
│   ├── WorkspaceCard.tsx
│   └── CreateWorkspaceModal.tsx
├── project/
│   ├── ProjectCard.tsx
│   ├── ProjectTabs.tsx
│   └── CreateProjectModal.tsx
├── notes/
│   ├── NoteEditor.tsx
│   ├── NoteList.tsx
│   └── NoteCard.tsx
├── ai/
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── ModelSelector.tsx
│   └── StreamingText.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    └── ConfirmDialog.tsx

hooks/
├── useAuth.ts
├── useWorkspaces.ts
├── useProjects.ts
├── useNotes.ts
├── useAiChat.ts
└── useWebSocket.ts

services/
├── api.ts                        ← Axios instance + interceptors
├── auth.service.ts
├── workspace.service.ts
├── project.service.ts
├── notes.service.ts
├── ai.service.ts                 ← SSE streaming logic
└── github.service.ts

store/
├── auth.store.ts                 ← Zustand: user + tokens
├── ui.store.ts                   ← Zustand: sidebar open, theme
└── notification.store.ts

utils/
├── format.ts                     ← date, number formatting
├── tokens.ts                     ← estimate token count
├── code-highlight.ts
└── cn.ts                         ← clsx + tailwind-merge
```

---

## State Management

**Zustand** for global client state (auth, UI preferences):
```typescript
// store/auth.store.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: User) => void;
  setTokens: (tokens: TokenPair) => void;
  logout: () => void;
}
```

**React Query (TanStack Query)** for server state (projects, notes, workspaces):
```typescript
// hooks/useProjects.ts
export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectService.getProjects(workspaceId),
    staleTime: 1000 * 60 * 5,
  });
}
```

**No Redux.** Zustand for client state + React Query for server state covers 100% of use cases cleanly.

---

## API Handling

```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor: inject access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → refresh → retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await authService.refresh();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## Authentication Flow (Next.js App Router)

```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const session = await getServerSession();  // Check cookie server-side
  if (!session) redirect('/login');
  return <DashboardShell>{children}</DashboardShell>;
}
```

Client-side: Zustand store hydrated from cookie on initial load.

---

## SSE Streaming (AI Chat)

```typescript
// services/ai.service.ts
export async function streamChat(
  payload: ChatPayload,
  onToken: (token: string) => void,
  onComplete: (meta: CompleteMeta) => void
) {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = JSON.parse(line.slice(6));
      if (data.done) onComplete(data);
      else onToken(data.token);
    }
  }
}
```

---

# PHASE 10: MOBILE ARCHITECTURE

## Flutter Folder Structure

```
lib/
├── main.dart
├── app.dart                      ← MaterialApp setup, routing, theme
│
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   └── app_constants.dart
│   ├── errors/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart       ← Dio HTTP client
│   │   └── auth_interceptor.dart
│   ├── storage/
│   │   └── secure_storage.dart   ← flutter_secure_storage for tokens
│   └── router/
│       └── app_router.dart       ← GoRouter configuration
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/auth_model.dart
│   │   │   └── repositories/auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/user.dart
│   │   │   └── repositories/auth_repository.dart
│   │   └── presentation/
│   │       ├── providers/auth_provider.dart
│   │       └── screens/
│   │           ├── login_screen.dart
│   │           └── register_screen.dart
│   │
│   ├── dashboard/
│   │   └── presentation/screens/dashboard_screen.dart
│   │
│   ├── workspaces/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │       └── screens/workspace_screen.dart
│   │
│   ├── projects/
│   │   └── presentation/screens/
│   │       ├── projects_list_screen.dart
│   │       └── project_detail_screen.dart
│   │
│   ├── notes/
│   │   └── presentation/screens/
│   │       ├── notes_list_screen.dart
│   │       └── note_editor_screen.dart
│   │
│   └── ai_chat/
│       └── presentation/
│           ├── providers/chat_provider.dart
│           └── screens/chat_screen.dart
│
├── shared/
│   ├── widgets/
│   │   ├── app_bar_widget.dart
│   │   ├── loading_widget.dart
│   │   ├── empty_state_widget.dart
│   │   └── error_widget.dart
│   └── theme/
│       ├── app_theme.dart
│       └── color_scheme.dart
│
└── injection_container.dart       ← GetIt DI setup
```

---

## State Management (Flutter)

Using **Riverpod** (preferred for this architecture):
```dart
// features/projects/presentation/providers/projects_provider.dart
final projectsProvider = AsyncNotifierProvider.autoDispose
    .family<ProjectsNotifier, List<Project>, String>((ref, workspaceId) {
  return ProjectsNotifier(
    repository: ref.watch(projectRepositoryProvider),
    workspaceId: workspaceId,
  );
});
```

---

## Networking (Dio Client)
```dart
// core/network/api_client.dart
class ApiClient {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 60),
  ));

  ApiClient() {
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(LogInterceptor(responseBody: false));
  }
}
```

---

## AI Chat (SSE Streaming in Flutter)
```dart
// features/ai_chat/data/repositories/chat_repository_impl.dart
Stream<String> streamChat(ChatRequest request) async* {
  final response = await _client.post(
    '/ai/chat',
    data: request.toJson(),
    options: Options(responseType: ResponseType.stream),
  );
  
  await for (final chunk in response.data.stream) {
    final decoded = utf8.decode(chunk);
    final lines = decoded.split('\n').where((l) => l.startsWith('data: '));
    for (final line in lines) {
      final data = json.decode(line.substring(6));
      if (!data['done']) yield data['token'] as String;
    }
  }
}
```

---

## Screen List

| Screen | Route | Purpose |
|---|---|---|
| LoginScreen | `/login` | Auth |
| RegisterScreen | `/register` | Auth |
| DashboardScreen | `/` | Overview |
| WorkspacesScreen | `/workspaces` | List workspaces |
| ProjectsScreen | `/workspaces/:id` | Projects in workspace |
| ProjectDetailScreen | `/projects/:id` | Notes/AI/GitHub tabs |
| NoteEditorScreen | `/notes/:id` | Markdown note editor |
| ChatScreen | `/chat/:conversationId` | AI chat |
| SettingsScreen | `/settings` | Profile + preferences |

---

# PHASE 11: SECURITY DESIGN

## Authentication Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with salt rounds = 12 |
| JWT access token | RS256 (asymmetric) or HS256, 15-min TTL |
| Refresh token | Random UUID stored as SHA-256 hash in DB |
| Refresh token rotation | New refresh token issued on every refresh |
| Token blacklisting | Revoked tokens stored in Redis with TTL |
| HTTPS only | TLS enforced in production via reverse proxy |

## Authorization

```typescript
// Ownership pattern — every query scoped to authenticated user
async getProject(projectId: string, userId: string): Promise<Project> {
  const project = await this.prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { userId },        // ← always filter by owner
      deletedAt: null,
    },
  });
  if (!project) throw new NotFoundException('Project not found');
  return project;
}
```

All data access is user-scoped. No resource is accessible without verifying the requesting user owns it.

## API Protection

```typescript
// main.ts — global protections
app.use(helmet());                          // Security headers
app.use(compression());
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
});
app.use(cookieParser());
```

```typescript
// Rate limiting with @nestjs/throttler
ThrottlerModule.forRoot([
  { name: 'global', ttl: 60000, limit: 100 },      // 100 req/min
  { name: 'ai', ttl: 60000, limit: 10 },           // 10 AI req/min
])
```

## Input Validation

All DTOs validated with `class-validator` via global `ValidationPipe`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // strip unknown fields
  forbidNonWhitelisted: true,
  transform: true,           // auto-transform types
}));
```

## Data Protection

- SQL injection: prevented by Prisma parameterized queries (never raw string interpolation)
- XSS: DOMPurify on frontend for any user-generated HTML content
- CSRF: not needed for JWT Bearer auth (stateless)
- File uploads: mime-type validation, file size limit (10MB), virus scan placeholder
- Sensitive env vars: never committed, `.env.example` only in repo

---

# PHASE 12: DEPLOYMENT ARCHITECTURE

## Development — Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: devflow_db
      POSTGRES_USER: devflow_user
      POSTGRES_PASSWORD: devflow_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]   # optional GPU support

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://devflow_user:devflow_pass@postgres:5432/devflow_db
      REDIS_URL: redis://redis:6379
      OLLAMA_URL: http://ollama:11434
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
      - ollama
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  ollama_models:
  uploads:
```

---

## Production — Free Hosting Strategy

### Frontend (Next.js)
| Option | Free Tier | Notes |
|---|---|---|
| **Vercel** ✅ | Unlimited hobby | Best for Next.js, auto-deploy from GitHub |
| Netlify | 100GB bandwidth | Good alternative |
| Cloudflare Pages | Unlimited | Fastest globally |

**Recommended: Vercel** — zero config Next.js deployment

### Backend (NestJS)
| Option | Free Tier | Notes |
|---|---|---|
| **Railway** ✅ | $5 credit/month | Best DX, supports Docker |
| Render | 750h/month | Spins down on inactivity |
| Fly.io | 3 shared VMs free | Good for always-on apps |
| Koyeb | 2 instances free | EU/US regions |

**Recommended: Railway** — Docker support, persistent disk, Redis add-on

### PostgreSQL
| Option | Free Tier | Notes |
|---|---|---|
| **Neon** ✅ | 0.5GB free | Serverless, pgvector supported |
| Supabase | 500MB, 2 projects | pgvector supported |
| Railway PostgreSQL | Shared with backend | Easy if using Railway |

**Recommended: Neon** — pgvector support, serverless scaling, generous free tier

### Redis
| Option | Free Tier | Notes |
|---|---|---|
| **Upstash** ✅ | 10,000 cmd/day | Serverless Redis, REST API |
| Railway Redis | Same container | Easy for Railway users |

**Recommended: Upstash** — free forever plan, no credit card

### Ollama (AI)
⚠️ Ollama cannot be hosted on free tiers (requires 4–8GB RAM for models)

**Strategy:**
- In development: Ollama runs locally on developer's machine
- Demo/portfolio: Use Groq free API (Llama3 hosted, 30 req/min free) as fallback
- Production self-host: User's own VPS (Oracle Free Tier — 24GB RAM ARM VM!)
- Fallback: OpenRouter free tier for demos

### Oracle Cloud Always Free (Best Hidden Gem)
```
4 ARM CPUs, 24GB RAM, 200GB storage — FOREVER FREE
→ Run: Ollama + NestJS backend + PostgreSQL all in one VM
→ Use Caddy as reverse proxy with auto-HTTPS
→ Perfect for portfolio demos
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bervProject/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: devflow-backend
```

---

# PHASE 13: TESTING STRATEGY

## Unit Testing — Backend (Jest)

```typescript
// ai.service.spec.ts
describe('AiService', () => {
  let service: AiService;
  let ollamaClient: jest.Mocked<OllamaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: OllamaClient, useValue: createMockOllamaClient() },
      ],
    }).compile();
    service = module.get(AiService);
  });

  describe('buildContext', () => {
    it('should trim messages to fit within token limit', async () => {
      // arrange: 20 messages
      // act: buildContext with maxTokens=1000
      // assert: returned messages fit within limit
    });
  });
});
```

**Coverage targets:** Services 80%+, Utilities 100%, Guards 90%

## Integration Testing — Backend

```typescript
// auth.integration.spec.ts
describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();         // uses test database
    await seedTestData(app);
  });

  it('POST /auth/register should create user and return tokens', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'Test123!', displayName: 'Test' })
      .expect(201)
      .expect(res => {
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
      });
  });
});
```

## API Testing (Postman / Bruno)

- Maintain a **Bruno** (open-source Postman alternative) collection in `/api-tests/`
- Organize by module: Auth, Users, Workspaces, Projects, AI, GitHub
- Include environment files: dev, staging
- Pre-request scripts for token injection
- Test scripts for response validation

## Frontend Testing (Vitest + Testing Library)

```typescript
// components/ai/ChatMessage.test.tsx
describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage role="user" content="Hello AI" />);
    expect(screen.getByText('Hello AI')).toBeInTheDocument();
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', () => {
    const content = '```javascript\nconsole.log("hello")\n```';
    render(<ChatMessage role="assistant" content={content} />);
    expect(screen.getByTestId('code-block')).toBeInTheDocument();
  });
});
```

## E2E Testing (Playwright)

```typescript
// e2e/auth.spec.ts
test('complete auth flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name=email]', 'e2e@test.com');
  await page.fill('[name=password]', 'Test123!');
  await page.fill('[name=displayName]', 'E2E User');
  await page.click('[type=submit]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
});
```

---

# PHASE 14: 20-PHASE IMPLEMENTATION ROADMAP

---

### Phase 1 — Project Foundation & Setup
**Goal:** Initialize all repositories, configure tooling, Docker environment working

**Tasks:**
- Create GitHub monorepo structure: `/frontend`, `/backend`, `/mobile`, `/docs`
- Initialize Next.js 14 with TypeScript, Tailwind, shadcn/ui
- Initialize NestJS with TypeScript
- Initialize Flutter project
- Configure ESLint, Prettier, Husky pre-commit hooks
- Set up Docker Compose (PostgreSQL + Redis + Ollama)
- Configure environment variable structure (.env.example)
- Initialize Prisma with PostgreSQL connection
- Run `docker-compose up` and verify all services healthy

**Files/Modules Created:**
```
devflow-ai/
├── frontend/         (Next.js initialized)
├── backend/          (NestJS initialized)
├── mobile/           (Flutter initialized)
├── docker-compose.yml
├── .github/
│   └── workflows/ci.yml
└── README.md
```

**Expected Output:** All 3 apps run locally, Docker services start, Prisma connects to DB

**Estimated Time:** 3–4 days (6–8 hours total)

---

### Phase 2 — Database Schema & Prisma Setup
**Goal:** Complete database schema deployed and Prisma client generated

**Tasks:**
- Write complete Prisma schema (all 12 tables)
- Create initial migration
- Enable pgvector extension
- Write database seed script (test user, workspace, project)
- Create Prisma module in NestJS
- Test all table creation with seed data
- Set up database backup strategy (pg_dump script)

**Files Created:**
```
backend/prisma/schema.prisma
backend/prisma/migrations/001_initial/
backend/prisma/seed.ts
backend/src/database/prisma.module.ts
backend/src/database/prisma.service.ts
```

**Expected Output:** `npx prisma migrate dev` runs clean, seed populates test data

**Estimated Time:** 2–3 days (4–6 hours)

---

### Phase 3 — Authentication System (Backend)
**Goal:** Complete JWT auth with register, login, refresh, logout working

**Tasks:**
- Install: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `ioredis`
- Implement AuthModule (controller, service, DTOs)
- Implement JwtStrategy, JwtAuthGuard
- Refresh token storage in Redis with TTL
- Implement token rotation on refresh
- Implement refresh token blacklisting on logout
- Write unit tests for AuthService
- Write integration tests for all auth endpoints

**Files Created:**
```
backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/jwt.strategy.ts
├── guards/jwt-auth.guard.ts
├── dto/register.dto.ts
├── dto/login.dto.ts
└── auth.service.spec.ts
```

**Expected Output:** All auth endpoints tested via Postman/Bruno, tokens work correctly

**Estimated Time:** 3–4 days (6–10 hours)

---

### Phase 4 — Authentication System (Frontend)
**Goal:** Login, register pages complete; protected routing working; token management

**Tasks:**
- Build login and register pages with Zod validation
- Implement Zustand auth store
- Configure Axios with interceptors (token injection + auto-refresh)
- Implement Next.js middleware for route protection
- Build auth layout (centered card design)
- Connect to backend auth endpoints
- Handle error states (invalid credentials, network errors)
- Persist auth state across page refreshes (httpOnly cookie or memory)

**Files Created:**
```
frontend/app/(auth)/login/page.tsx
frontend/app/(auth)/register/page.tsx
frontend/store/auth.store.ts
frontend/services/api.ts
frontend/services/auth.service.ts
frontend/middleware.ts
frontend/components/auth/LoginForm.tsx
frontend/components/auth/RegisterForm.tsx
```

**Expected Output:** User can register, login, be redirected to dashboard, logout

**Estimated Time:** 3–4 days (6–8 hours)

---

### Phase 5 — Dashboard Shell & Navigation
**Goal:** Complete app shell — sidebar, header, responsive layout

**Tasks:**
- Build dashboard layout with sidebar navigation
- Implement collapsible sidebar (Zustand UI store)
- Build workspace switcher in sidebar
- Implement dark/light mode toggle (next-themes)
- Build header with user menu, notifications bell
- Build breadcrumb navigation
- Mobile responsive with hamburger menu
- Loading skeleton for content areas

**Files Created:**
```
frontend/app/(dashboard)/layout.tsx
frontend/components/layout/Sidebar.tsx
frontend/components/layout/Header.tsx
frontend/components/layout/Breadcrumb.tsx
frontend/components/layout/MobileNav.tsx
frontend/store/ui.store.ts
```

**Expected Output:** Professional app shell with navigation, dark mode, responsive design

**Estimated Time:** 3–5 days (8–12 hours) — UI polish takes time

---

### Phase 6 — Workspace & Project CRUD
**Goal:** Full workspace and project management — CRUD, listing, search

**Tasks:**
- Backend: WorkspacesModule (controller, service, DTOs, guards)
- Backend: ProjectsModule (controller, service, DTOs, search)
- Backend: Ownership validation on all routes
- Frontend: Workspace list page with create/edit/delete
- Frontend: Project grid per workspace
- Frontend: Create project modal with tags input
- Frontend: Project detail page with tab structure (placeholder tabs)
- React Query hooks for data fetching + optimistic updates
- Search bar with debounce

**Files Created:**
```
backend/src/modules/workspaces/
backend/src/modules/projects/
frontend/app/(dashboard)/workspaces/
frontend/app/(dashboard)/projects/[id]/
frontend/hooks/useWorkspaces.ts
frontend/hooks/useProjects.ts
```

**Expected Output:** Full CRUD working end-to-end for workspaces and projects

**Estimated Time:** 4–5 days (10–12 hours)

---

### Phase 7 — Notes System
**Goal:** Markdown notes with editor, full-text search, versioning

**Tasks:**
- Backend: NotesModule with CRUD, FTS, versioning
- PostgreSQL tsvector trigger for auto-updating search_vector
- Frontend: Notes list in project (sidebar style)
- Frontend: Markdown editor (react-md-editor or CodeMirror)
- Frontend: Live preview toggle
- Frontend: Note search with instant results
- Frontend: Tags input for notes
- Auto-save on edit (debounced 2 seconds)

**Files Created:**
```
backend/src/modules/notes/
frontend/components/notes/NoteEditor.tsx
frontend/components/notes/NoteList.tsx
frontend/hooks/useNotes.ts
```

**Expected Output:** Full notes CRUD with Markdown editor, search, auto-save working

**Estimated Time:** 4–5 days (10–12 hours)

---

### Phase 8 — Ollama Integration & Basic AI Chat
**Goal:** AI chat working end-to-end with streaming responses

**Tasks:**
- Install Ollama locally and pull llama3 model
- Backend: OllamaClient service (HTTP calls to Ollama API)
- Backend: AiModule with chat endpoint (SSE streaming)
- Backend: ConversationsModule (CRUD)
- Backend: Context builder (conversation history)
- Backend: Prompt builder with system prompt template
- Frontend: ChatInterface component
- Frontend: SSE streaming text rendering (token by token)
- Frontend: Model selector dropdown
- Frontend: Code block rendering with syntax highlight in responses

**Files Created:**
```
backend/src/modules/ai/
├── ollama.client.ts
├── prompt.builder.ts
├── context.service.ts
├── ai.controller.ts
├── ai.service.ts
frontend/components/ai/ChatInterface.tsx
frontend/components/ai/ChatMessage.tsx
frontend/components/ai/StreamingText.tsx
frontend/services/ai.service.ts
```

**Expected Output:** Full streaming AI chat working — type message → see response stream in

**Estimated Time:** 5–6 days (12–15 hours) — streaming is tricky, plan for debugging

---

### Phase 9 — Code Analysis & Debug Tools
**Goal:** Code analysis and debugging assistant pages working

**Tasks:**
- Backend: `/ai/analyze-code` with structured JSON response
- Backend: `/ai/debug` with structured debugging response
- Frontend: Code Analysis page with CodeMirror input
- Frontend: Structured results accordion (summary, explanation, issues)
- Frontend: Debug page with two-panel input
- Frontend: Structured debug output with tabs
- Frontend: "Save as Note" button for both tools
- Rate limiting: 10 requests/minute for AI endpoints

**Files Created:**
```
frontend/app/(dashboard)/tools/code-analysis/page.tsx
frontend/app/(dashboard)/tools/debug/page.tsx
frontend/components/tools/CodeAnalysisPanel.tsx
frontend/components/tools/DebugPanel.tsx
```

**Expected Output:** Code analysis and debugging tools fully functional

**Estimated Time:** 3–4 days (8–10 hours)

---

### Phase 10 — Documentation Generator
**Goal:** Documentation generator for JSDoc, Python docstrings, README sections

**Tasks:**
- Backend: `/ai/generate-docs` with style-specific prompts
- Frontend: Documentation generator page
- Frontend: Split-view editor (input left, output right)
- Frontend: Style selector (JSDoc / TSDoc / Python / README)
- Frontend: Copy to clipboard and export as .md file
- Test with real code samples for all 4 styles

**Files Created:**
```
backend/src/modules/ai/docs.generator.ts
frontend/app/(dashboard)/tools/docs-generator/page.tsx
frontend/components/tools/DocsGeneratorPanel.tsx
```

**Expected Output:** Documentation generator working for all 4 styles

**Estimated Time:** 2–3 days (5–7 hours)

---

### Phase 11 — Embeddings & RAG Pipeline
**Goal:** Notes and files indexed with embeddings; RAG context injection in chat

**Tasks:**
- Install `pgvector` extension, update Prisma schema
- Backend: EmbeddingService (Ollama → nomic-embed-text or llama3 embeddings)
- Backend: Chunking service (split text into 1000-char chunks with overlap)
- Backend: RagService (vector cosine similarity search)
- Trigger embedding generation on note save/update (async)
- Inject RAG context into AI chat system prompt when `useRag: true`
- Frontend: "Enable RAG" toggle in chat interface
- Test RAG quality: index a long note, ask question about it

**Files Created:**
```
backend/src/modules/ai/embedding.service.ts
backend/src/modules/ai/chunker.service.ts
backend/src/modules/ai/rag.service.ts
```

**Expected Output:** Ask AI about indexed notes and get contextually relevant answers

**Estimated Time:** 4–5 days (10–14 hours) — debugging vector search is time-intensive

---

### Phase 12 — GitHub Integration
**Goal:** Connect GitHub repos, fetch metadata, browse files, trigger indexing

**Tasks:**
- Backend: GithubModule (connect, metadata fetch, file listing)
- Backend: RepoIndexerService with BullMQ background job
- Backend: WebSocket progress notifications during indexing
- Frontend: GitHub tab in project detail
- Frontend: Repo info card with metadata
- Frontend: File tree browser component
- Frontend: Indexing progress indicator (WebSocket)
- Test with a public GitHub repository

**Files Created:**
```
backend/src/modules/github/
frontend/components/github/RepoCard.tsx
frontend/components/github/FileTree.tsx
frontend/components/github/IndexingProgress.tsx
frontend/hooks/useWebSocket.ts
```

**Expected Output:** Connect GitHub repo, view metadata, trigger indexing, see progress

**Estimated Time:** 4–5 days (10–12 hours)

---

### Phase 13 — Notifications System
**Goal:** Real-time in-app notifications via WebSocket

**Tasks:**
- Backend: NotificationsGateway (Socket.IO / WS)
- Backend: NotificationsService (save + broadcast)
- Backend: Emit events from indexing jobs
- Frontend: WebSocket connection in useWebSocket hook
- Frontend: Notification bell with unread count badge
- Frontend: Notification dropdown with list
- Frontend: Toast notifications for real-time events (sonner)

**Files Created:**
```
backend/src/modules/notifications/
frontend/components/layout/NotificationBell.tsx
frontend/components/layout/NotificationDropdown.tsx
frontend/store/notification.store.ts
```

**Expected Output:** Real-time notifications working for indexing completion events

**Estimated Time:** 2–3 days (5–7 hours)

---

### Phase 14 — User Profile & Settings
**Goal:** Profile page, settings, avatar upload, AI model preferences

**Tasks:**
- Backend: UsersModule complete (profile, avatar, stats)
- Backend: File upload with Multer (local storage)
- Frontend: Settings page with tabs (Profile / AI / Appearance)
- Frontend: Avatar upload with preview
- Frontend: AI model preferences per user
- Frontend: Account stats display (notes, projects, AI requests)
- Frontend: Danger zone (delete account)

**Files Created:**
```
frontend/app/(dashboard)/settings/page.tsx
frontend/components/settings/ProfileForm.tsx
frontend/components/settings/AvatarUpload.tsx
frontend/components/settings/AiPreferences.tsx
```

**Expected Output:** Full profile management working with avatar upload

**Estimated Time:** 2–3 days (5–7 hours)

---

### Phase 15 — Flutter Mobile App (Core)
**Goal:** Mobile app with auth, workspaces, projects, and notes

**Tasks:**
- Set up GoRouter navigation
- Implement Dio HTTP client with auth interceptors
- Build login and register screens
- Build dashboard with workspace list
- Build project list and detail screens
- Build notes list and simple editor (plain Markdown)
- Test on Android emulator and physical device

**Files Created:**
```
mobile/lib/features/auth/
mobile/lib/features/workspaces/
mobile/lib/features/projects/
mobile/lib/features/notes/
mobile/lib/core/network/
```

**Expected Output:** Mobile app running — can authenticate, browse workspaces/projects, read notes

**Estimated Time:** 7–10 days (15–20 hours) — Flutter learning curve

---

### Phase 16 — Flutter AI Chat (Mobile)
**Goal:** AI chat working on mobile with streaming text

**Tasks:**
- Implement SSE streaming in Flutter (Dio with stream response)
- Build chat UI screen
- Build chat input with submit button
- Streaming text widget (append tokens as they arrive)
- Model selector bottom sheet
- Chat history persistence
- Test streaming quality on mobile

**Files Created:**
```
mobile/lib/features/ai_chat/
├── data/
├── domain/
└── presentation/screens/chat_screen.dart
```

**Expected Output:** Full streaming AI chat working on mobile

**Estimated Time:** 4–5 days (10–12 hours)

---

### Phase 17 — Testing Suite
**Goal:** Unit, integration, and E2E tests written and passing

**Tasks:**
- Backend unit tests: AuthService, AiService, PromptBuilder (70%+ coverage)
- Backend integration tests: all API endpoints via supertest
- Frontend unit tests: ChatMessage, NoteEditor, StreamingText components
- E2E tests (Playwright): auth flow, create project, create note, AI chat
- Set up test database (separate DB for tests)
- Add test scripts to package.json
- CI pipeline runs tests on every push

**Files Created:**
```
backend/src/**/*.spec.ts
frontend/src/**/*.test.tsx
e2e/*.spec.ts
```

**Expected Output:** CI passes with 70%+ backend coverage, all E2E tests green

**Estimated Time:** 4–5 days (10–12 hours)

---

### Phase 18 — Performance & Polish
**Goal:** Loading states, error boundaries, optimistic updates, performance optimization

**Tasks:**
- Add React Suspense + loading skeletons everywhere
- Add React Error Boundaries for all major sections
- Implement optimistic updates for notes (instant UI feedback)
- Add infinite scroll for notes and projects
- Next.js Image optimization for avatars
- Add keyboard shortcuts (Cmd+K command palette)
- Lighthouse audit: target 90+ performance score
- Fix all TypeScript strict mode errors

**Files Created:**
```
frontend/components/common/Skeleton.tsx
frontend/components/common/ErrorBoundary.tsx
frontend/components/common/CommandPalette.tsx
```

**Expected Output:** App feels snappy, no loading jank, all TypeScript errors resolved

**Estimated Time:** 3–4 days (7–10 hours)

---

### Phase 19 — Production Deployment
**Goal:** App live on free hosting with CI/CD

**Tasks:**
- Deploy frontend to Vercel (connect GitHub repo, auto-deploy)
- Deploy backend to Railway (Docker deployment)
- Set up Neon PostgreSQL (import schema + seed)
- Set up Upstash Redis
- Configure all production environment variables
- Set up GitHub Actions CI/CD pipeline
- Test all features on production URLs
- Configure custom subdomain (optional: use railway.app subdomain)
- Run Ollama on Oracle Free VM or set up Groq fallback

**Expected Output:** DevFlow AI live at a public URL, all features working end-to-end

**Estimated Time:** 3–4 days (7–10 hours) — environment debugging takes time

---

### Phase 20 — Portfolio Polish
**Goal:** Project presentation-ready for job applications

**Tasks:**
- Write comprehensive README.md (see Phase 18 structure)
- Record a 3-5 minute demo video (Loom)
- Create project screenshots for portfolio website
- Add project to portfolio website
- Write case study for LinkedIn
- Create architecture diagram (Excalidraw)
- Add `CONTRIBUTING.md` and `LICENSE`
- Open source the repository (public GitHub)
- Submit to relevant communities (Dev.to article, r/programming)
- Add live demo link to all portfolio channels

**Expected Output:** Portfolio-ready project with compelling README, demo video, and documentation

**Estimated Time:** 3–4 days (6–8 hours)

---

**Total Realistic Timeline: 14–18 weeks at 2–4 hours/day**

---

# PHASE 15: GIT STRATEGY

## Repository Structure

```
devflow-ai/                    ← Monorepo (single GitHub repository)
├── frontend/                  ← Next.js
├── backend/                   ← NestJS
├── mobile/                    ← Flutter
├── docs/                      ← Architecture docs, ADRs
├── api-tests/                 ← Bruno API test collections
├── e2e/                       ← Playwright E2E tests
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
└── CONTRIBUTING.md
```

## Branch Strategy

```
main                    ← Production-ready code only, protected
│
develop                 ← Integration branch, all features merge here
│
├── feature/auth-system
├── feature/ai-chat
├── feature/notes-editor
├── fix/token-refresh-loop
└── chore/update-dependencies
```

**Branch naming convention:**
```
feature/[short-description]     ← new features
fix/[short-description]         ← bug fixes
chore/[short-description]       ← maintenance
docs/[short-description]        ← documentation
refactor/[short-description]    ← refactoring
test/[short-description]        ← adding tests
```

## Commit Style (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
```
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    formatting, no logic change
refactor: code refactor, no feature/fix
test:     adding tests
chore:    build, dependencies, config
perf:     performance improvement
```

**Examples:**
```bash
feat(auth): add refresh token rotation
fix(ai): resolve SSE stream not closing properly
docs(readme): add deployment instructions
refactor(notes): extract search logic to service
test(auth): add integration tests for login flow
chore(deps): update prisma to 5.8.0
```

## PR Workflow

```
1. Create feature branch from develop
2. Implement feature + tests
3. Self-review diff before opening PR
4. Open PR targeting develop
5. Fill in PR template (description, testing notes, screenshots)
6. CI must pass (lint + tests)
7. Merge with "Squash and merge" for clean history
8. Delete branch after merge
9. Periodically merge develop → main for releases
```

**PR Template:**
```markdown
## What does this PR do?
Brief description of changes

## How was this tested?
- [ ] Unit tests added/updated
- [ ] Manual testing steps: ...

## Screenshots (if UI changes)

## Breaking changes?
- [ ] None
- [ ] Yes: describe impact

## Checklist
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No console.log left in code
- [ ] Environment variables documented in .env.example
```

---

# PHASE 16: CODING STANDARDS

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files (TS/React) | kebab-case | `chat-interface.tsx`, `auth.service.ts` |
| React Components | PascalCase | `ChatInterface`, `NoteEditor` |
| Functions/variables | camelCase | `buildContext`, `accessToken` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `DEFAULT_MODEL` |
| Interfaces/Types | PascalCase with I prefix | `IUser`, `ChatPayload` |
| Enums | PascalCase | `ProjectStatus.ACTIVE` |
| Database tables | snake_case | `ai_requests`, `github_repos` |
| API endpoints | kebab-case | `/ai/analyze-code`, `/github/repos` |
| Env variables | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |

## Error Handling

### Backend Pattern
```typescript
// All service methods throw specific exceptions
// Controllers never catch — global exception filter handles all

// services throw:
throw new NotFoundException('Project not found');
throw new ConflictException('Email already registered');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Validation failed');
throw new InternalServerErrorException('AI service unavailable');

// Global exception filter maps to consistent response shape:
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Project not found" },
  "statusCode": 404
}
```

### Frontend Pattern
```typescript
// React Query handles loading/error states
// Never use try-catch in components — use error boundaries

// Service layer throws typed errors
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) { super(message); }
}

// Global error boundary catches unhandled errors
// Toast notifications for user-visible errors
```

## Logging

```typescript
// backend/src/common/logger.service.ts
// Use NestJS built-in Logger, structured format

@Injectable()
class AppLogger extends Logger {
  log(message: string, context?: string) {
    super.log({ message, context, timestamp: new Date().toISOString() });
  }
  
  error(message: string, trace?: string, context?: string) {
    super.error({ message, trace, context, timestamp: new Date().toISOString() });
  }
}

// Log levels:
// ERROR  — exceptions, failed operations
// WARN   — rate limit hits, deprecations
// LOG    — request lifecycle, job start/end
// DEBUG  — verbose (disabled in production)
// VERBOSE — extremely detailed (dev only)
```

## Documentation Style

```typescript
/**
 * Builds context for an AI conversation request.
 * Fetches message history and trims to fit within the token budget.
 *
 * @param conversationId - UUID of the conversation
 * @param maxTokens - Maximum tokens to allow for context (default: 3500)
 * @returns Array of messages that fit within the token budget
 * @throws NotFoundException if conversation does not exist
 *
 * @example
 * const context = await contextService.buildContext(convId, 2000);
 */
async buildContext(conversationId: string, maxTokens = 3500): Promise<Message[]>
```

---

# PHASE 17: AI CODING WORKFLOW

## Using Claude Code

**Best for:** Architecture decisions, complex logic, refactoring, debugging hard problems

### Setup
```bash
npm install -g @anthropic-ai/claude-code
cd devflow-ai
claude                    # starts Claude Code in your project
```

### High-Value Prompts for DevFlow AI

**Module Generation:**
```
Create a complete NestJS module for managing developer notes.

Requirements:
- Module: NotesModule
- Full CRUD endpoints with proper NestJS decorators
- Prisma ORM for database access
- DTOs with class-validator
- JwtAuthGuard on all routes
- Ownership validation (user can only access their own notes)
- Full-text search endpoint
- Response uses standard { success, data } format

Database schema:
[paste your notes table SQL here]

Generate: notes.module.ts, notes.controller.ts, notes.service.ts, 
create-note.dto.ts, update-note.dto.ts
```

**Debugging (paste error + context):**
```
I'm getting this error in my NestJS SSE streaming endpoint:
[paste error]

Here's my controller code:
[paste code]

Here's my Ollama client:
[paste code]

The expected behavior is: tokens should stream to the client as 
they arrive from Ollama. What's wrong and how do I fix it?
```

**Architecture Review:**
```
Review this NestJS AI module architecture for correctness, 
security issues, and performance problems:

[paste module code]

Concerns:
1. Is the context window management correct?
2. Will the SSE stream leak if the client disconnects?
3. Is the rate limiting applied correctly?

Suggest specific improvements with code examples.
```

---

## Using ChatGPT (GPT-4o)

**Best for:** Boilerplate generation, Flutter UI code, quick code snippets

### Prompts

**Component Generation:**
```
Create a React TypeScript component called ChatMessage that:
- Props: { role: 'user' | 'assistant', content: string, createdAt: Date }
- Renders differently for user vs assistant messages
- Uses shadcn/ui components (no external UI libraries)
- Parses and syntax-highlights code blocks in content
- Shows a copy button on code blocks
- Uses Tailwind CSS for styling
- Dark mode compatible

Match the style of a professional developer tool (like Linear or Cursor)
```

**Flutter Screen:**
```
Create a Flutter screen called ChatScreen that:
- Shows a list of messages (user/assistant)
- Has a text input at the bottom with send button
- Messages stream in token-by-token (receives Stream<String>)
- Uses Riverpod for state management
- Shows a typing indicator while streaming
- Uses Material 3 design
- Handles keyboard avoiding (input stays above keyboard)
```

---

## Using Gemini

**Best for:** Long document analysis, understanding large codebases, generating test data

### Prompts

**Test Generation:**
```
Here is a NestJS service file:
[paste full service file]

Generate comprehensive Jest unit tests that:
- Test every public method
- Use proper mocking with jest.fn()
- Cover happy path, error cases, and edge cases
- Use describe blocks organized by method name
- Include meaningful test descriptions
- Mock the PrismaService and any external dependencies
```

**Code Review:**
```
Review this complete feature implementation for a production SaaS app:

[paste all files for the feature]

Check for:
1. Security vulnerabilities
2. Performance issues (N+1 queries, memory leaks)
3. Missing error handling
4. TypeScript type safety
5. Missing validation
6. Any logic bugs

Format findings as a structured code review with severity: Critical/High/Medium/Low
```

---

## AI Workflow Best Practices

1. **Always provide context first** — paste relevant files before asking questions
2. **One problem per prompt** — don't ask 5 things at once
3. **Specify the stack** — always mention NestJS/Next.js/Flutter explicitly
4. **Ask for explanations** — "explain what this code does before modifying it"
5. **Iterate, don't regenerate** — ask Claude to fix specific parts, not rewrite everything
6. **Review AI output critically** — never blindly copy-paste; read and understand
7. **Use for scaffolding** — AI generates 80%, you refine the remaining 20%
8. **Version control before applying** — commit working code before applying AI changes

---

# PHASE 18: PORTFOLIO PRESENTATION

## Resume Description

```
DevFlow AI | Full-Stack AI Developer Workspace
Next.js 14 · NestJS · Flutter · PostgreSQL · Ollama · Docker

Built a production-grade AI-powered developer workspace enabling code analysis, 
intelligent debugging, documentation generation, and conversational AI via 
locally-run LLMs. Implemented RAG pipeline with pgvector for codebase Q&A, 
real-time streaming AI responses via SSE, and background job processing with 
BullMQ. Delivered full Web (Next.js) and Mobile (Flutter) clients with 
WebSocket-driven notifications.

Key Engineering Highlights:
• Designed RAG pipeline: Ollama embeddings → pgvector cosine search → context injection
• Implemented SSE streaming with context window management for token-budget compliance
• Built modular NestJS monolith with JWT auth, Redis token blacklisting, rate limiting
• Deployed on Railway + Vercel + Neon with GitHub Actions CI/CD ($0 infrastructure cost)
• Flutter cross-platform mobile app with real-time AI streaming
```

---

## LinkedIn Description

```
🚀 Just shipped DevFlow AI — a full-stack AI developer workspace I built from scratch.

The idea: what if every developer had a private, free AI coding assistant that never 
sends code to the cloud?

💡 What it does:
→ AI chat powered by local Llama 3 / CodeLlama (via Ollama)
→ Code analysis: explain, review, find bugs
→ Debugging assistant: diagnose errors with fix suggestions
→ Documentation generator (JSDoc, docstrings, README)
→ RAG: ask questions about your own notes & codebase
→ GitHub repo indexing for AI context
→ Full mobile app (Flutter)

🔧 Under the hood:
→ Next.js 14 (App Router) + shadcn/ui
→ NestJS with modular architecture
→ PostgreSQL + pgvector for vector search
→ Redis + BullMQ for background jobs
→ SSE for real-time AI streaming
→ Docker Compose for local dev
→ Deployed for $0 (Vercel + Railway + Neon + Upstash)

This project taught me more about system design, AI integration, and production 
engineering than anything else I've built.

Live demo: [link]
GitHub: [link]

#OpenSource #AI #FullStack #NextJS #NestJS #Flutter #RAG #LLM
```

---

## GitHub README Structure

```markdown
# DevFlow AI 🤖
> AI-powered developer workspace — locally-run LLMs, zero cloud dependency

[![CI](https://github.com/username/devflow-ai/actions/workflows/ci.yml/badge.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()

[Live Demo](https://devflow-ai.vercel.app) · 
[API Docs](https://api.devflow.ai/docs) · 
[Watch Demo (3 min)](https://loom.com/share/xxx)

---

## ✨ Features
[Feature overview with GIF/screenshot for each major feature]

## 🏗️ Architecture
[Architecture diagram from Excalidraw]

## 🛠️ Tech Stack
[Table with frontend/backend/AI/devops columns]

## 🚀 Quick Start (Local Development)
[Step-by-step Docker Compose setup — should work in <5 minutes]

## 📁 Project Structure
[Monorepo overview]

## 🔌 API Reference
[Link to detailed API docs or Bruno collection]

## 🤖 AI Models
[How to switch models, which models are supported]

## 🧪 Testing
[How to run tests]

## 📱 Mobile App
[Flutter setup instructions]

## 🌐 Deployment
[Free deployment guide]

## 📸 Screenshots
[8–10 high-quality screenshots]

## 🗺️ Roadmap
[Future features planned]

## 🤝 Contributing
[CONTRIBUTING.md link]

## 📝 License
MIT
```

---

## Screenshot Ideas

1. **Dashboard** — workspaces overview with dark mode
2. **Project Detail** — showing 4 tabs (Notes / AI / GitHub / Files)
3. **AI Chat** — streaming response mid-generation with code block
4. **Code Analysis** — complex code input + structured output
5. **Debug Assistant** — error input + 3 fix options displayed
6. **Documentation Generator** — function input + JSDoc output
7. **Notes Editor** — Markdown editor with preview, tags
8. **GitHub Integration** — repo connected, file tree, indexing progress
9. **Mobile App (Flutter)** — side-by-side iOS + Android on chat screen
10. **Architecture Diagram** — Excalidraw system overview

---

## Demo Flow (3-minute video)

```
0:00 — Hook: "What if you had a free, private AI coding assistant?"
0:15 — Quick signup + login
0:30 — Create workspace + project "E-commerce App"
0:45 — Connect GitHub repo → trigger indexing
1:00 — AI Chat: ask about the codebase → RAG response with context
1:30 — Code Analysis: paste complex function → show structured output
2:00 — Debug: paste TypeError → show 3 fix options
2:20 — Documentation Generator: generate JSDoc for API function
2:40 — Mobile: show same chat working on Flutter phone
2:55 — Architecture overview (quick)
3:00 — GitHub + live link
```

---

# PHASE 19: FUTURE IMPROVEMENTS

## Advanced Roadmap

### Level 1 — Enhanced Core (3–6 months)
1. **Multi-model routing** — automatically select best model per task type (CodeLlama for code, Llama3 for chat)
2. **Conversation branching** — fork conversations at any point
3. **Note linking** — `[[note-name]]` wiki-style bidirectional links
4. **AI-powered search** — semantic search across all notes using embeddings
5. **Export suite** — export projects as ZIP (notes + docs + chat history)

### Level 2 — Team Features (6–12 months)
6. **Team workspaces** — invite members, RBAC (Owner/Editor/Viewer)
7. **Real-time collaboration** — Yjs CRDT for collaborative note editing
8. **Comments system** — comment on notes, resolve threads
9. **Activity feed** — see what teammates are working on
10. **Shared AI conversations** — attach team context to project AI

### Level 3 — AI Agents (6–12 months)
11. **Project Planner Agent** — describe project → get breakdown of tasks, user stories, tech stack recommendations
12. **Code Review Agent** — review all code files in project, generate report
13. **Documentation Agent** — automatically document entire codebase
14. **Refactoring Agent** — identify tech debt, suggest specific refactors

### Level 4 — IDE / Browser Extensions
15. **VS Code Extension** — sidebar panel with DevFlow AI context from current file
16. **Browser Extension** — AI overlay on GitHub, StackOverflow, MDN
17. **JetBrains Plugin** — for IntelliJ/WebStorm users
18. **CLI Tool** — `devflow analyze src/auth.ts` from terminal

### Level 5 — Platform Features
19. **Prompt Marketplace** — share and discover system prompts
20. **Model Fine-tuning** — fine-tune on user's own codebase (with Ollama modelfiles)
21. **Analytics Dashboard** — AI usage, most-used models, cost savings vs ChatGPT
22. **Webhook Integration** — trigger AI actions from GitHub push events
23. **Zapier/Make Integration** — connect to external workflows
24. **Public API** — let others build on top of DevFlow AI

---

# PHASE 20: DAY-BY-DAY EXECUTION PLAN

## Assumptions
- 2–4 hours daily
- Weekdays only (5 days/week)
- Total: ~16 weeks (80 working days)

---

## Week 1–2: Foundation (Days 1–10)
**Goal: Everything runs locally**

| Day | Focus | Tasks |
|-----|-------|-------|
| 1 | Monorepo setup | Create GitHub repo, folder structure, README |
| 2 | Next.js init | npx create-next-app, Tailwind, shadcn/ui setup |
| 3 | NestJS init | nest new backend, configure TypeScript strict |
| 4 | Flutter init | flutter create mobile, GoRouter, Riverpod setup |
| 5 | Docker Compose | PostgreSQL + Redis + Ollama containers running |
| 6 | Prisma setup | schema.prisma written, first migration, pgvector enabled |
| 7 | Seed + ESLint | Database seeded, ESLint + Prettier configured, Husky |
| 8 | Env config | .env.example complete, ConfigModule in NestJS |
| 9 | CI pipeline | GitHub Actions: lint + build on push |
| 10 | Buffer day | Fix any setup issues, document setup in README |

---

## Week 3–4: Auth System (Days 11–20)
**Goal: Auth working end-to-end**

| Day | Focus | Tasks |
|-----|-------|-------|
| 11 | Auth backend | AuthModule scaffold, register endpoint |
| 12 | JWT strategy | JwtStrategy, JwtAuthGuard, login endpoint |
| 13 | Refresh tokens | Redis storage, refresh + logout endpoints |
| 14 | Auth tests | Unit + integration tests for auth |
| 15 | Login page | Next.js login page, Zod validation, error states |
| 16 | Register page | Register page, form validation |
| 17 | Zustand auth | Auth store, token management |
| 18 | Axios interceptors | Token injection + auto-refresh on 401 |
| 19 | Route protection | Next.js middleware + dashboard redirect |
| 20 | Auth polish | Loading states, error toasts, full flow test |

---

## Week 5–6: Dashboard + Projects (Days 21–30)

| Day | Focus | Tasks |
|-----|-------|-------|
| 21 | Dashboard shell | Layout, sidebar component |
| 22 | Sidebar navigation | Links, active states, collapse |
| 23 | Dark mode | next-themes, ThemeToggle component |
| 24 | Header | User menu, breadcrumbs |
| 25 | Workspaces backend | WorkspacesModule complete |
| 26 | Workspaces frontend | List page, create modal, delete |
| 27 | Projects backend | ProjectsModule, search endpoint |
| 28 | Projects frontend | Grid, create modal, status badges |
| 29 | Project detail | Tabbed layout (placeholder tabs) |
| 30 | React Query | Hooks for workspaces + projects, optimistic updates |

---

## Week 7–8: Notes System (Days 31–40)

| Day | Focus | Tasks |
|-----|-------|-------|
| 31 | Notes backend | NotesModule CRUD |
| 32 | Full-text search | tsvector trigger, search endpoint |
| 33 | Note versioning | note_versions table, version save on update |
| 34 | Notes list UI | Sidebar-style notes list, search bar |
| 35 | Markdown editor | react-md-editor integration |
| 36 | Live preview | Split view toggle |
| 37 | Auto-save | Debounced save, "Saving..." indicator |
| 38 | Tags | Tag input component, filter by tag |
| 39 | Notes tests | Unit tests for NotesService |
| 40 | Notes polish | Empty states, keyboard shortcuts |

---

## Week 9–10: AI Core (Days 41–50)

| Day | Focus | Tasks |
|-----|-------|-------|
| 41 | Ollama setup | Pull llama3 model, test /api/generate |
| 42 | OllamaClient | HTTP client service in NestJS |
| 43 | Prompt builder | System prompt templates |
| 44 | SSE streaming | Controller SSE endpoint, stream from Ollama |
| 45 | Context service | Conversation history fetch + token trimming |
| 46 | Chat UI | ChatInterface component structure |
| 47 | Streaming text | Token-by-token render in React |
| 48 | Code blocks | Syntax highlighting in chat responses |
| 49 | Model selector | Dropdown, model list endpoint |
| 50 | Chat persistence | Conversation + messages saved to DB |

---

## Week 11–12: AI Tools + RAG (Days 51–60)

| Day | Focus | Tasks |
|-----|-------|-------|
| 51 | Code analysis backend | /ai/analyze-code structured response |
| 52 | Code analysis UI | CodeMirror input, structured output display |
| 53 | Debug backend | /ai/debug structured response |
| 54 | Debug UI | Two-panel input, tabbed output |
| 55 | Docs generator | Backend + frontend |
| 56 | Embeddings service | Ollama embeddings API call |
| 57 | Chunker service | Text chunking with overlap |
| 58 | pgvector search | Cosine similarity query |
| 59 | RAG in chat | Vector search → context injection |
| 60 | RAG testing | Index a long note, test Q&A quality |

---

## Week 13–14: GitHub + Notifications (Days 61–70)

| Day | Focus | Tasks |
|-----|-------|-------|
| 61 | GitHub API client | Public repo metadata fetch |
| 62 | Connect repo | POST /github/connect endpoint |
| 63 | File tree fetch | GitHub contents API, recursive fetch |
| 64 | BullMQ setup | Queue + worker configuration |
| 65 | Repo indexer | Background job: fetch → chunk → embed |
| 66 | GitHub UI | Repo card, file tree component |
| 67 | WebSocket setup | Socket.IO gateway in NestJS |
| 68 | Progress events | Emit indexing progress via WebSocket |
| 69 | Notifications UI | Bell icon, dropdown, toast |
| 70 | Notifications polish | Mark as read, clear all |

---

## Week 15–16: Mobile + Polish (Days 71–80)

| Day | Focus | Tasks |
|-----|-------|-------|
| 71 | Flutter auth | Login + register screens |
| 72 | Flutter navigation | GoRouter setup, bottom nav |
| 73 | Flutter workspaces | List screen |
| 74 | Flutter projects | List + detail screen |
| 75 | Flutter notes | Notes list + simple editor |
| 76 | Flutter AI chat | Chat screen, SSE streaming |
| 77 | Flutter polish | Loading states, error handling |
| 78 | Web performance | Skeletons, lazy loading, Lighthouse audit |
| 79 | E2E tests | Playwright tests for core flows |
| 80 | Final buffer | Bug fixes, documentation, README |

---

## Week 17–18: Deployment + Portfolio (Days 81–90)

| Day | Focus | Tasks |
|-----|-------|-------|
| 81 | Neon DB setup | Create database, run migrations |
| 82 | Railway backend | Deploy Docker container |
| 83 | Vercel frontend | Connect repo, configure env vars |
| 84 | Upstash Redis | Set up, connect to backend |
| 85 | Ollama (Oracle VM) | Set up Oracle free VM, deploy Ollama |
| 86 | CI/CD pipeline | GitHub Actions deploy on main push |
| 87 | Production testing | Test all features on live URLs |
| 88 | Screenshots + demo | Record Loom video, capture screenshots |
| 89 | README complete | Full README, architecture diagram |
| 90 | Portfolio launch | Update portfolio, LinkedIn post, GitHub public |

---

## Milestone Summary

| Milestone | Target Day | Deliverable |
|---|---|---|
| Foundation complete | Day 10 | All services running locally |
| Auth working | Day 20 | Login/register E2E |
| Core CRUD working | Day 30 | Workspaces + Projects |
| Notes complete | Day 40 | Full notes system |
| AI Chat working | Day 50 | Streaming chat E2E |
| AI Tools + RAG | Day 60 | All AI features |
| GitHub + Notifications | Day 70 | GitHub integration |
| Mobile complete | Day 77 | Flutter app functional |
| Tests + Polish | Day 80 | 70% test coverage |
| **Live in production** | Day 87 | Public URL working |
| **Portfolio ready** | Day 90 | Open sourced, showcased |

---

*This document serves as the complete blueprint for DevFlow AI. Each phase builds on the previous, ensuring steady, verifiable progress toward a portfolio-quality production application. Follow the day-by-day plan, use AI tools to accelerate implementation, and prioritize shipping over perfection in early phases.*

---

**DevFlow AI — Built by developers, for developers.**  
*Version 1.0.0 | Architecture Document | Ready for Implementation*
