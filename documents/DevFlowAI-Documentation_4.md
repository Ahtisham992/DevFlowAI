# DevFlow AI: Production Deployment & Verification

## 1. Cloud Infrastructure & Architecture

Moving from a local Docker Compose setup to a production-ready cloud architecture required distributing our services across multiple specialized platforms to balance cost, performance, and scalability. The final production architecture is 100% free-tier compliant while maintaining high availability.

### 1.1 Web Frontend (Vercel)
- **Host**: Vercel
- **Live URL**: `https://dev-flow-ai-five.vercel.app`
- **Why**: Vercel provides zero-config Next.js deployments, global CDN caching, and automatic CI/CD from GitHub. 
- **Configuration**: The `NEXT_PUBLIC_API_URL` environment variable was set to point to the production Render backend instead of localhost.

### 1.2 Backend API (Render)
- **Host**: Render (Web Service)
- **Live URL**: `https://devflow-api-comy.onrender.com`
- **Why**: Render offers native Node.js/NestJS support, easy environment variable management, and automatic HTTPS.
- **Configuration**: Configured CORS to whitelist the Vercel frontend domain, preventing unauthorized clients from accessing the API.

### 1.3 PostgreSQL Database (Neon)
- **Host**: Neon.tech
- **Why**: Serverless Postgres that scales to zero and supports the `pgvector` extension out of the box, which is critical for our RAG (Retrieval-Augmented Generation) embeddings.
- **Configuration**: The `DATABASE_URL` was securely stored in Render. We executed `npx prisma migrate deploy` and `npx prisma db seed` during the build step.

### 1.4 Redis Cache (Upstash)
- **Host**: Upstash
- **Why**: Serverless Redis with a generous free tier. It provides the exact same API as local Redis, making it a drop-in replacement.
- **Usage**: Used for BullMQ background job processing, caching GitHub repositories, and JWT session blacklisting.

### 1.5 AI Runtime (Oracle Cloud Infrastructure)
- **Host**: Oracle Cloud "Always Free" ARM VM
- **IP**: `http://152.67.112.59:11434`
- **Why**: Ollama requires significant RAM to run models like LLaMA 3. Oracle Cloud provides a 24GB RAM / 4 OCPU ARM instance entirely for free, which is perfect for hosting an LLM API.
- **Configuration**: Configured `OLLAMA_HOST=0.0.0.0` and opened port `11434` in the Oracle Cloud VCN ingress rules. The backend connects to this via the `OLLAMA_URL` environment variable.

---

## 2. Production Verification & Testing

To ensure the system works reliably under real-world conditions, we implemented two rigorous testing suites.

### 2.1 End-to-End (E2E) Testing with Playwright
We implemented automated browser tests to verify critical user flows in the live production environment.
- **Framework**: Playwright
- **Coverage**: User Registration, Login, Workspace Creation, Project Setup.
- **Execution**: The tests were configured to dynamically use `PLAYWRIGHT_TEST_BASE_URL=https://dev-flow-ai-five.vercel.app`.
- **Result**: The test suite successfully completed all end-to-end flows in **15.8 seconds** with zero errors.

### 2.2 API Load Testing with k6
To verify that our free-tier architecture (specifically Neon and Render) wouldn't collapse under a sudden influx of traffic, we used `k6` to stress-test the backend.
- **Framework**: k6 by Grafana
- **Scenario**: 50 concurrent Virtual Users (VUs) constantly hitting the `/` endpoint and the `/auth/login` endpoint for 60 seconds.
- **Result**: 
  - Over 1,800 requests were processed.
  - The NestJS `ThrottlerModule` (Rate Limiter) successfully intercepted the flood. It allowed exactly 100 requests per IP and returned `429 Too Many Requests` for the rest, preventing database connection exhaustion.
  - 95th percentile latency (p95) for successful requests remained under 800ms.
