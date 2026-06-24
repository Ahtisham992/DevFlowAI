# DevFlow AI — Week 4-10 Complete Documentation

> **Stack:** Next.js · NestJS · PostgreSQL (`pgvector`) · Socket.io · Ollama · BullMQ (Optional)  
> **Period:** Week 4–10 (Days 31–70)  
> **Status:** Notes System, AI Core, SSE Streaming, RAG, and GitHub Indexing Complete

---

## Table of Contents

1. [Markdown Notes System (Week 4)](#1-markdown-notes-system-week-4)
2. [AI Core & Ollama Integration (Week 5-6)](#2-ai-core--ollama-integration-week-5-6)
3. [Vector Search & RAG Pipeline (Week 7-8)](#3-vector-search--rag-pipeline-week-7-8)
4. [GitHub Repository Integration (Week 9-10)](#4-github-repository-integration-week-9-10)
5. [Real-time WebSockets (Socket.io)](#5-real-time-websockets-socketio)
6. [Issues Encountered & Fixes (Part 2)](#6-issues-encountered--fixes-part-2)

---

## 1. Markdown Notes System (Week 4)

In Week 4, we built a fully-featured, project-specific markdown note-taking system. Developers need a place to jot down thoughts without leaving their workspace.

### Backend Data Model Updates
We updated the `schema.prisma` to link Notes directly to both Users and Projects.
```prisma
model Note {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  tags      String[] // PostgreSQL array type for fast filtering
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  projectId String?  // Optional: Can belong to a specific project
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Frontend Markdown Editor
We integrated `uiw/react-md-editor` on the Next.js frontend.
- **Why this library?** It supports GitHub Flavored Markdown (GFM), syntax highlighting for code blocks, and has a built-in split-pane preview mode.
- **Dark Mode Support**: It automatically reads the `data-color-mode` attribute from the HTML tag, hooking perfectly into our `next-themes` setup.

### Debounced Auto-Save
To prevent data loss without overwhelming the NestJS backend with `PATCH` requests on every keystroke, we implemented a custom `useEffect` debounce mechanism.

```typescript
const [content, setContent] = useState(initialContent);

// Auto-save logic
useEffect(() => {
  if (content === initialContent) return; // Skip initial load

  const timeoutId = setTimeout(async () => {
    try {
      await api.patch(`/notes/${noteId}`, { content });
      // Show subtle "Saved" indicator
    } catch (error) {
      // Handle save failure
    }
  }, 1000); // 1-second debounce

  return () => clearTimeout(timeoutId);
}, [content]);
```

---

## 2. AI Core & Ollama Integration (Week 5-6)

Weeks 5 and 6 focused on connecting the NestJS backend to a local Ollama instance to provide private, free AI capabilities.

### Ollama Docker Configuration
Ollama runs in our `docker-compose.yml` on port `11434`. 
- **Privacy**: Because Ollama runs locally, no proprietary code is ever sent to OpenAI or Anthropic.
- **Model**: We default to `llama3`, which provides a great balance of speed and coding capability.

### NestJS AI Service
The `AiService` acts as an HTTP proxy between our frontend and the Ollama API container. 

```typescript
@Injectable()
export class AiService {
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  async generateResponse(prompt: string, model: string = 'llama3') {
    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
      model,
      prompt,
      stream: false,
    });
    return response.data.response;
  }
}
```

### Server-Sent Events (SSE) Streaming
For chat interfaces, waiting 15 seconds for a complete AI response is terrible UX. We implemented SSE to stream tokens one by one.

**Backend Implementation:**
NestJS uses the `@Sse()` decorator to return an `Observable` that emits data chunks.
```typescript
@Sse('chat/stream')
streamChat(@Query('prompt') prompt: string): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    // Connect to Ollama with stream: true
    // On every data chunk received from Ollama:
    subscriber.next({ data: { text: chunk } });
    
    // On finish:
    subscriber.complete();
  });
}
```

**Frontend Implementation:**
The Next.js client uses the native browser `EventSource` API (or custom fetch streams) to read the chunks and append them to the React state, creating the "typing" effect.

---

## 3. Vector Search & RAG Pipeline (Week 7-8)

To make the AI aware of the user's specific project, we built a Retrieval-Augmented Generation (RAG) pipeline using PostgreSQL's `pgvector` extension.

### Database Migration for `pgvector`
We ran raw SQL migrations in Prisma to enable the extension and add vector columns.
```sql
-- Migration: 20260612_add_pgvector.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "RepoFile" ADD COLUMN "embedding" vector(768);
```

### Embedding Generation
Instead of sending raw text to Ollama, we first generate mathematically dense "embeddings" (arrays of floats) representing the semantic meaning of the code.
- We use the `nomic-embed-text` model via Ollama, which generates vectors of exactly 768 dimensions.

### The RAG Search Process (Raw SQL)
When a user asks: *"Where is the JWT validation logic?"*
1. We ask Ollama to embed the question into a 768-dimensional vector.
2. We query the database using the `<->` (cosine distance) operator to find the closest code snippets.

```typescript
// Prisma raw query for cosine similarity search
const closestFiles = await this.prisma.$queryRaw`
  SELECT id, path, content, 1 - (embedding <-> ${questionVector}::vector) as similarity
  FROM "RepoFile"
  WHERE "projectId" = ${projectId}
  ORDER BY embedding <-> ${questionVector}::vector
  LIMIT 5;
`;
```
3. We take the content of those 5 files, prepend them as "Context" to the user's prompt, and send the massive combined string to `llama3`.

---

## 4. GitHub Repository Integration (Week 9-10)

To get code into the database, we needed a way to ingest entire GitHub repositories.

### The Ingestion Workflow
1. **API Trigger**: `POST /github/index` receives a repository URL (e.g., `https://github.com/facebook/react.git`).
2. **Child Process Execution**: The NestJS service uses Node's built-in `child_process.exec` to run `git clone` into the operating system's temporary directory (`/tmp/` on Linux/Mac, `%TEMP%` on Windows).
   ```typescript
   import { exec } from 'child_process';
   import { promisify } from 'util';
   const execAsync = promisify(exec);
   
   await execAsync(`git clone ${repoUrl} ${tempDir}`);
   ```
3. **Recursive File Parsing**: The system walks the directory tree using `fs.readdirSync`. 
   - **Crucial Rule**: We explicitly skip the `.git` folder, `node_modules`, and binary files (images, compiled assets) to prevent database bloat and token limits.
4. **Chunking**: Large files (over 2000 tokens) are split into smaller chunks so the embedding model can process them accurately.
5. **Database Insertion**: The parsed files, along with their generated embeddings, are saved to the `RepoFile` table linked to the user's Project.
6. **Cleanup**: Finally, the system runs `rm -rf` (or `Remove-Item` on Windows) to delete the cloned repository from the local disk.

---

## 5. Real-time WebSockets (Socket.io)

Indexing a massive repository can take several minutes. To keep the user informed, we implemented WebSockets.

### NestJS Notifications Gateway
We used `@nestjs/platform-socket.io` to create a WebSocket server running on the same port as the REST API.
- Users authenticate to the WebSocket using their existing JWT.
- They join a "room" specific to their `userId`.

### Progress Streaming
During the GitHub ingestion loop, the backend emits progress events directly to the user's room.
```typescript
@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  sendProgress(userId: string, current: number, total: number, filename: string) {
    this.server.to(`user_${userId}`).emit('index_progress', {
      current,
      total,
      filename,
      percent: Math.round((current / total) * 100)
    });
  }
}
```

### Frontend Progress Bar
On the Next.js side, a `SocketProvider` wraps the application. When it receives the `index_progress` event, it updates a global Zustand state, which renders a floating progress bar (e.g., *"Indexing util.ts (45%)"*).

---

## 6. Issues Encountered & Fixes (Part 2)

| Issue | Root Cause | Fix Applied |
|---|---|---|
| Prisma `vector` type missing | Prisma natively doesn't support pgvector arrays well | Added `Unsupported("vector(768)")` to schema and used raw SQL for queries |
| React-MD-Editor Hydration Errors | SSR mismatch between Next.js server and client rendering | Dynamically imported the editor with `{ ssr: false }` |
| Ollama Connection Refused | Docker bridge network issues | Used `host.docker.internal` (Windows/Mac) instead of `localhost` inside the container |
| SSE Streams abruptly closing | Nginx/Proxy timeouts buffering the stream | Sent headers: `Cache-Control: no-cache` and `Connection: keep-alive` |
| Git Clone hanging | Prompting for credentials on private repos | Enforced `GIT_TERMINAL_PROMPT=0` in the Node child process environment |
