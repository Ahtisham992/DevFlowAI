<div align="center">
  <img src="https://raw.githubusercontent.com/Ahtisham992/DevFlowAI/main/apps/web/public/logo.png" alt="DevFlow AI Logo" width="120" />
  <h1>DevFlow AI 🚀</h1>
  <p><strong>One workspace. Every developer workflow. Zero cloud dependency for AI.</strong></p>

  <p>
    <a href="https://dev-flow-ai-five.vercel.app"><img src="https://img.shields.io/badge/Live_App-Vercel-black?logo=vercel" alt="Live App" /></a>
    <a href="https://devflow-api-comy.onrender.com"><img src="https://img.shields.io/badge/API-Render-black?logo=render" alt="Live API" /></a>
    <img src="https://img.shields.io/badge/status-Production%20Ready-success" alt="Status" />
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  </p>
</div>

---

## 🌟 What is DevFlow AI?

**DevFlow AI** is a unified, AI-powered developer workspace designed to completely eliminate context-switching. 

It brings project planning, intelligent codebase analysis, real-time RAG (Retrieval-Augmented Generation), automated debugging, and persistent developer notes into a single cohesive platform. 

Most importantly, DevFlow AI is powered by locally-running Large Language Models (LLMs) via **Ollama**. Your proprietary code never leaves your machine. No API costs. Total privacy.

---

## 🏗️ Architecture & Tech Stack

DevFlow AI is built as a robust **Monorepo** using the latest enterprise-grade technologies.

| Layer | Technology | Description |
|---|---|---|
| **Web App** | Next.js 15, React 19 (Hosted on **Vercel**) | App Router, Server Components, shadcn/ui components |
| **Mobile App** | React Native CLI | Native iOS & Android application sharing the same core backend |
| **Backend API** | NestJS (Hosted on **Render**) | Modular architecture, WebSockets for real-time progress |
| **Database** | PostgreSQL + pgvector (Hosted on **Neon.tech**) | Relational data + Vector embeddings for semantic AI search |
| **Cache & Auth** | Redis (Hosted on **Upstash**) | JWT Token blacklisting and session management |
| **AI Runtime** | Ollama (Hosted on **Oracle Cloud VM**) | Remote execution of Llama 3 and Nomic Embeddings |
| **ORM** | Prisma 7 | Type-safe database interactions and automated migrations |
| **State** | Zustand + React Query | Global UI state management and server-data caching |

---

## ✨ Core Features

- 🔒 **Stateless & Secure Auth**: JWT-based authentication with seamless background token refreshing and Redis-backed logout blacklisting.
- 📂 **Workspaces & Projects**: Organize your codebase hierarchy to keep mental context clean.
- 📝 **Markdown Developer Notes**: Live-preview markdown editor with auto-save and syntax highlighting.
- 🧠 **Context-Aware AI Chat**: Ask questions about your code. The backend uses `pgvector` to perform semantic similarity searches across your indexed repositories to provide pinpoint accurate answers.
- ⚡ **Real-Time Streaming**: AI responses are streamed token-by-token to both Web and Mobile via Server-Sent Events (SSE).
- 📱 **Cross-Platform Sync**: The React Native mobile app shares the exact same backend and database, meaning your notes and AI chats are available on the go.

---

## 📂 Repository Structure

```text
devflow-ai/
├── apps/
│   ├── web/          # Next.js Web Frontend (Port 3000)
│   ├── backend/      # NestJS API Server (Port 3001)
│   └── mobile/       # React Native iOS & Android App
├── documents/        # Detailed Engineering Architecture Guides
├── docker-compose.yml# Local Infrastructure (Postgres, Redis, Ollama)
└── package.json      # Root workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop (with WSL 2 enabled on Windows)
- Git

### 1. Start the Infrastructure
We use Docker to instantly spin up PostgreSQL (with pgvector), Redis, and Ollama.
```bash
docker compose up -d
```

### 2. Pull the AI Models
You need an LLM for chat and an embedding model for vectorizing your code.
```bash
docker exec -it devflow_ollama ollama pull llama3
docker exec -it devflow_ollama ollama pull nomic-embed-text
```

### 3. Setup the Backend
```bash
cd apps/backend
cp .env.example .env  # Ensure variables map to the docker ports
npm install
npx prisma migrate dev
npx prisma db seed    # Optional: populate test data
npm run start:dev
```

### 4. Setup the Web Frontend
In a new terminal:
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` to view the web application.

### 5. Setup the Mobile App
In a new terminal:
```bash
cd apps/mobile/DevFlowMobile
npm install
npm start -- --reset-cache
```

```

### 6. Run E2E Tests
We use Playwright for robust End-to-End testing of our core web flows. Make sure both the backend and web frontend are running locally, then execute:
```bash
cd apps/web
npm run test:e2e
```
This will run the test suite in headless Chromium mode and output a detailed HTML report.

---

## 📚 Documentation
For an exhaustive, deep-dive look into how this system was built, please refer to the markdown guides located in the `/documents` folder:
- `DevFlowAI-Documentation_1.md`: Weeks 1-3 (Foundation & Auth)
- `DevFlowAI-Documentation_2.md`: Weeks 4-10 (RAG, WebSockets, GitHub Indexing)
- `DevFlowAI-Documentation_3.md`: Weeks 11-12 (Mobile App & Polish)
- `DevFlowAI-Documentation_4.md`: Weeks 13-14 (Production Deployment, Neon, Render, Oracle Cloud, E2E & Load Testing)

---

## 📄 License
This project is licensed under the MIT License.