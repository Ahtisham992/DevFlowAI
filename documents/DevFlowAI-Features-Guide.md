# DevFlow AI: Features & Workflows Guide

This document breaks down the implementation of the core features in DevFlow AI. It explains how different parts of the stack interact to deliver value to the user.

## Table of Contents
1. [Authentication Flow](#1-authentication-flow)
2. [Workspaces & Projects Organization](#2-workspaces--projects-organization)
3. [Markdown Notes System](#3-markdown-notes-system)
4. [GitHub Repository Indexing](#4-github-repository-indexing)
5. [Context-Aware AI Chat](#5-context-aware-ai-chat)

---

## 1. Authentication Flow

DevFlow AI relies on a highly secure, stateless JWT authentication system combined with Redis blacklisting.

### Registration & Login
1. **Frontend (Next.js/React Native)**: The user submits their email and password using a form protected by `zod` validation.
2. **Backend (NestJS)**: The `AuthService` hashes the password using `bcrypt` (10 salt rounds) and stores the user in PostgreSQL.
3. **Token Generation**: The backend generates two JWTs using `@nestjs/jwt`:
   - `accessToken`: Short-lived (15 minutes), used for authorization.
   - `refreshToken`: Long-lived (7 days), used to silently request new access tokens.
4. **Client Storage**: 
   - **Web**: Both tokens are saved into `localStorage` via Zustand's `persist` middleware. The `accessToken` is also saved as a cookie to allow Next.js edge Middleware to protect routes.
   - **Mobile**: Tokens are securely saved into `AsyncStorage`.

### Silent Token Refresh (Axios Interceptors)
If a user stays on the dashboard longer than 15 minutes, their `accessToken` expires.
1. An Axios response interceptor catches the `401 Unauthorized` error.
2. It pauses the failed request, reads the `refreshToken`, and sends a silent `POST /auth/refresh` request to the backend.
3. The backend validates the refresh token, checks if it has been blacklisted in Redis, and issues a new pair of tokens.
4. The interceptor updates Zustand, updates the cookie, and finally retries the original request with the new `accessToken`. The user experiences zero interruption!

### Logout & Redis Blacklisting
When a user clicks "Log Out", we must ensure that their 7-day `refreshToken` cannot be stolen and reused.
1. The backend receives the `POST /auth/logout` request.
2. The `refreshToken` is extracted and inserted into **Redis** with a TTL of exactly 7 days.
3. The frontend clears Zustand, clears `AsyncStorage` / `localStorage`, and deletes the cookie.

---

## 2. Workspaces & Projects Organization

To prevent context-switching, developers need a place to logically group their tasks. DevFlow AI provides a simple hierarchy: `Workspaces -> Projects -> Notes`.

### API Structure
- `GET /workspaces`: Returns all workspaces owned by the `@CurrentUser()`. Includes a Prisma `_count` aggregation of how many projects are inside.
- `POST /projects`: Creates a project. Requires a valid `workspaceId`.

### Frontend Implementation
The Web dashboard uses a highly optimized Next.js App Router layout:
- `dashboard/workspaces/page.tsx`: Displays a grid of workspaces.
- `dashboard/projects/[id]/page.tsx`: Uses dynamic routing to display a specific project. It fetches the project details and renders a "Tabs" interface (Overview, Notes, Chat) to keep everything visible without navigating away.

---

## 3. Markdown Notes System

DevFlow AI provides a fully-featured Markdown editor for project-specific developer notes.

### Backend Data Model
- **Note**: Belongs to a User and optionally a Project.
- **Tags**: A PostgreSQL `String[]` array used for quick filtering.

### Web Implementation
- The editor uses `uiw/react-md-editor`, which supports GitHub Flavored Markdown (GFM).
- **Auto-save**: Notes utilize a debounced React effect. As the user types, a `setTimeout` waits for 1000ms of inactivity before firing a silent `PATCH /notes/:id` request to the backend. This prevents overwhelming the server while ensuring no data is lost.

### Mobile Implementation
- Mobile uses a simplified text input for notes, optimized for quick brain-dumps on the go. The UI matches the styling of the Web platform perfectly.

---

## 4. GitHub Repository Indexing

A major feature of DevFlow AI is its ability to "read" your code.

### The Indexing Workflow
1. **Connection**: A user connects a project to a GitHub repository URL via the frontend.
2. **Cloning**: The NestJS backend uses Node.js child processes (`exec`) to clone the repository into a temporary `/tmp/repo` folder.
3. **File Tree Parsing**: A recursive function traverses the cloned directory, explicitly ignoring `node_modules`, `.git`, and binary files.
4. **Embedding Generation**: 
   - The backend splits the code files into smaller "chunks" (e.g., 500 tokens each).
   - It sends each chunk to Ollama (using the `nomic-embed-text` model) to convert the text into mathematical vector embeddings.
   - These vectors are saved into PostgreSQL using Prisma and the `pgvector` extension.
5. **Real-Time Progress (WebSockets)**: While the indexing happens (which can take minutes for large repos), the `NotificationsGateway` uses `socket.io` to emit progress events (`"Processing file 5 of 150..."`) directly to the frontend.

---

## 5. Context-Aware AI Chat

The AI Chat interface is where the local LLM shines. It acts as an intelligent pair programmer that already knows your project's context.

### Chat Interface
- **Mobile & Web**: Both platforms provide a chat UI utilizing `lucide-react` icons and a message bubbles layout.

### Context Retrieval (RAG)
When the user types: *"How does the authentication work in this repo?"*
1. **Vectorization**: The backend turns the user's question into a vector embedding.
2. **Similarity Search**: A raw SQL query using `pgvector`'s `<->` (cosine distance) operator searches the database for the 5 closest code snippets from the user's connected GitHub repository.
3. **Prompt Construction**: The backend builds a massive prompt containing:
   - System Instructions: *"You are an expert developer. Use the provided context to answer the question."*
   - Retrieved Context: The 5 matched code snippets.
   - User Question.

### Streaming with Server-Sent Events (SSE)
Instead of forcing the user to wait 30 seconds for Ollama to generate a full response, the NestJS backend uses SSE (`@Sse()` decorator) to stream the response token-by-token.
- As Ollama generates words, NestJS instantly forwards them to the frontend.
- The React frontend receives the stream chunks and appends them to the current message state, creating a seamless "typing" effect.
