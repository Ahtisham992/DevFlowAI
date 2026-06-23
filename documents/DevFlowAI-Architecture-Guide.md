# DevFlow AI: Complete Architecture Guide

Welcome to the DevFlow AI Engineering Documentation. This guide is designed for new engineers, contributors, or anyone seeking to understand the complete architectural decisions, libraries, and structures used to build DevFlow AI.

## Table of Contents
1. [High-Level Architecture Overview](#1-high-level-architecture-overview)
2. [Backend Architecture (NestJS)](#2-backend-architecture-nestjs)
3. [Database & Persistence](#3-database--persistence)
4. [Frontend Architecture (Next.js)](#4-frontend-architecture-nextjs)
5. [Mobile Architecture (React Native)](#5-mobile-architecture-react-native)
6. [AI & Vector Search System](#6-ai--vector-search-system)

---

## 1. High-Level Architecture Overview

DevFlow AI is a robust **monorepo** consisting of three primary applications:
- **`apps/backend`**: A scalable NestJS API that serves as the single source of truth.
- **`apps/web`**: A modern Next.js React application (App Router) for the desktop experience.
- **`apps/mobile`**: A React Native CLI application for iOS and Android.

### Core Philosophy
- **Unified Backend**: Both the Web and Mobile applications consume the exact same NestJS REST API.
- **Stateless Authentication**: We use short-lived JWT Access Tokens combined with long-lived Refresh Tokens stored in HTTP-Only cookies (Web) or AsyncStorage (Mobile).
- **Local-First AI**: All AI processing runs completely locally using Ollama. No code is sent to third-party APIs like OpenAI, ensuring complete privacy.

---

## 2. Backend Architecture (NestJS)

The backend is built with **NestJS**, heavily inspired by Angular and Spring Boot patterns. It enforces a highly modular, Dependency Injection (DI) driven architecture.

### Module Structure
We divide the application into distinct, isolated modules:
- `AuthModule`: Handles registration, login, JWT validation, and Redis blacklisting.
- `AIModule`: Handles the connection to the Ollama HTTP API and parses streaming responses.
- `GithubModule`: Handles GitHub OAuth (if implemented) or simple repository scraping and indexing.
- `WorkspacesModule` & `ProjectsModule`: Manages user data boundaries.
- `NotesModule`: Handles CRUD for markdown notes.
- `NotificationsModule`: Implements WebSockets (`socket.io`) for real-time progress updates (e.g., during GitHub repo indexing).

### Request Lifecycle
1. **Middleware/Guards**: A request arrives and hits the `JwtAuthGuard`. The guard validates the JWT signature against the secret.
2. **Interceptors**: Validation interceptors use `class-validator` to ensure the incoming JSON payload perfectly matches the defined DTO (Data Transfer Object).
3. **Controller**: The `@Controller` routes the request to the correct method.
4. **Service**: The controller passes data to the `@Injectable()` Service, where all core business logic resides.
5. **Prisma**: The Service uses the globally injected `PrismaService` to safely query the PostgreSQL database.

---

## 3. Database & Persistence

### Prisma ORM
We utilize **Prisma 7** as our ORM. Prisma provides absolute type-safety from the database all the way to the frontend.
- `schema.prisma`: The single source of truth for our data models.
- **Migrations**: We use Prisma's automatic migration generation (`npx prisma migrate dev`).

### PostgreSQL & pgvector
The primary database is **PostgreSQL 16**.
- We specifically use a Docker container loaded with the `pgvector` extension.
- This allows us to store AI embeddings directly alongside our relational data, enabling us to perform semantic search (e.g., finding relevant code snippets based on a user's question).

### Redis
We use an Alpine Redis container purely as a fast, in-memory key-value store for **Refresh Token Blacklisting**.
- When a user logs out, their Refresh Token is written to Redis with a Time-To-Live (TTL) of 7 days.
- If a hijacked token attempts to refresh, the backend checks Redis. If the token is found in the blacklist, it throws a `401 Unauthorized` error.

---

## 4. Frontend Architecture (Next.js)

The web frontend is built using **Next.js 15** (App Router) and React 19.

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: A collection of beautifully designed, accessible components built on top of Radix UI primitives. We chose this over traditional component libraries (like MUI) because it gives us complete control over the component source code.
- **next-themes**: Handles the dynamic Dark/Light mode toggling by injecting `.dark` classes into the HTML root.

### State Management
- **Server State (`@tanstack/react-query`)**: Used for 90% of state management. React Query handles all `api.get()` calls, automatically caching the results, handling loading spinners, and allowing for "Optimistic Updates" (updating the UI instantly before the server responds).
- **Client State (Zustand)**: Used strictly for global UI state and Authentication state (`auth.store.ts`). Zustand's `persist` middleware automatically saves the JWT token to `localStorage`.

### Data Fetching
- **Axios Interceptors**: We use a centralized Axios instance. The **Request Interceptor** automatically attaches the Bearer token from Zustand. The **Response Interceptor** catches `401 Unauthorized` errors, silently requests a new Access Token using the Refresh Token, and retries the failed request seamlessly.

---

## 5. Mobile Architecture (React Native)

The mobile app (`apps/mobile/DevFlowMobile`) uses the **React Native CLI**.

### Navigation Structure (`react-navigation`)
- **RootNavigator**: The entry point. It checks `AsyncStorage` for an existing token. If found, it renders the `AppTabs`. If not, it renders the `AuthStack`.
- **AuthStack**: A Stack Navigator containing the Login and Register screens.
- **AppTabs**: A Bottom Tab Navigator that provides access to the Dashboard, Projects, Chat, and Profile screens.

### Code Sharing with Web
The mobile app heavily mirrors the web architecture:
- It uses the exact same **Zustand** store logic for authentication (swapping `localStorage` for `AsyncStorage`).
- It uses the same **Axios interceptor** pattern for silent token refreshes.
- UI elements map directly from Tailwind concepts to React Native `StyleSheet` properties.

---

## 6. AI & Vector Search System

The AI pipeline is the crown jewel of DevFlow AI.

### Ollama Runtime
Ollama runs locally as a Docker container. It exposes an HTTP API on port `11434`. The NestJS backend acts as a proxy to this API, ensuring that we never expose the Ollama port directly to the public internet.

### RAG (Retrieval-Augmented Generation) Workflow
1. **Indexing**: When a GitHub repo is connected, the backend clones it, chunks the text, and asks an Embedding Model (like `nomic-embed-text`) to turn those chunks into mathematical vectors.
2. **Storage**: These vectors are saved into the PostgreSQL database using the `pgvector` extension.
3. **Querying**: When a user asks a question in the AI Chat, the backend turns their question into a vector, searches PostgreSQL for the *closest mathematical matches* (cosine similarity), and retrieves the relevant code snippets.
4. **Generation**: The backend sends the user's question *along with the retrieved code snippets* to Ollama (e.g., `llama3`), asking it to generate a highly contextual answer.
5. **Streaming**: The response is streamed back to the Web or Mobile client using Server-Sent Events (SSE), creating a "typing" effect in real-time.
