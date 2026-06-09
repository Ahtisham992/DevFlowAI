# DevFlow AI 🚀

> One workspace. Every developer workflow. Zero cloud dependency for AI.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## What is DevFlow AI?

DevFlow AI is a unified, AI-powered developer workspace that eliminates
context-switching by bringing project planning, code understanding,
intelligent debugging, automated documentation, and persistent developer
notes into a single cohesive platform.

Powered by locally-running LLMs via Ollama — your code never leaves
your machine.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend | NestJS, PostgreSQL, Redis |
| AI | Ollama (Llama3, Mistral, CodeLlama) |
| Mobile | React Native CLI |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens |

---

## Project Structure
devflow-ai/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── backend/      # NestJS backend
│   └── mobile/       # React Native app
├── packages/
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── README.md

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/devflow-ai.git
cd devflow-ai
```

### 2. Start infrastructure
```bash
docker compose up -d
```

### 3. Setup backend
```bash
cd apps/backend
cp .env.example .env
# Fill in your .env values
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 4. Setup frontend
```bash
cd apps/web
npm install
npm run dev
```

### 5. Pull AI model
```bash
docker exec -it devflow_ollama ollama pull llama3
```

---

## Development Roadmap

- [x] Week 1-2: Foundation & monorepo setup
- [ ] Week 3-4: Authentication system
- [ ] Week 5-6: Dashboard & projects
- [ ] Week 7-8: Notes system
- [ ] Week 9-10: AI chat core
- [ ] Week 11-12: AI tools & RAG
- [ ] Week 13-14: GitHub integration
- [ ] Week 15-16: Mobile app
- [ ] Week 17-18: Deployment & portfolio

---

## License
MIT