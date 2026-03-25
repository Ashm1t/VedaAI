# Libra

<img width="1917" height="932" alt="image" src="https://github.com/user-attachments/assets/73811edd-60f8-4be1-bd42-d08b7db318bd" />

**AI-powered question paper generator for educators.**

**Live:** [http://16.176.211.15](http://16.176.211.15)

Hosted on AWS EC2 (`c7i-flex.large`) with Docker Compose and CI/CD via GitHub Actions — every push to `main` auto-deploys.

---

## Features

- **AI Question Paper Generation** — Upload syllabus/notes (PDF, images), and AI generates a complete, formatted question paper
- **OCR Pipeline** — Extracts text from uploaded PDFs and images automatically
- **Feedforward Chain** — AI analyzes content, identifies topics, and creates balanced question distributions across sections
- **LaTeX PDF Compilation** — Generates professional, print-ready PDFs using LaTeX templates
- **Real-time Progress** — WebSocket-based live progress tracking (OCR, chain, LaTeX, PDF compilation)
- **Question Paper Library** — Browse, view, and download all previously generated papers
- **Multiple AI Providers** — Supports Groq and Gemini API backends
- **Group Management** — Organize assignments by class/group
- **AI Teacher's Toolkit** — Additional AI-powered tools for educators
- **Configurable Parameters** — Set total marks, number of sections, question types, difficulty levels

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, Socket.io |
| Job Queue | BullMQ + Redis |
| Database | MongoDB |
| PDF Engine | LaTeX (TeX Live) + pdflatex |
| AI | Groq API / Gemini API |
| Deployment | Docker Compose, Nginx, GitHub Actions CI/CD |

---

## Architecture

```
                        AWS EC2 (c7i-flex.large)
                        ________________________
                       |                        |
  User --- HTTPS ----> |  Nginx (:80/443)       |
                       |    |         |          |
                       |  Frontend  Backend      |
                       |  (Next.js) (Express)    |
                       |             |    |      |
                       |          MongoDB Redis  |
                       |             |           |
                       |          BullMQ Worker  |
                       |             |           |
                       |          TeX Live       |
                       |          (pdflatex)     |
                       |________________________|
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- MongoDB
- Redis
- TeX Live (`pdflatex`)

### Setup

```bash
# Clone
git clone https://github.com/Ashm1t/Libra.git
cd Libra

# Install dependencies
npm install
cd server && npm install && cd ..

# Environment variables
cp .env.example .env
# Edit .env — add your GROQ_API_KEY

# Start backend
cd server && npm run dev

# Start frontend (separate terminal)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker (No Dependencies Required)

If you don't want to install MongoDB, Redis, or TeX Live locally, use Docker — it bundles everything for you.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# Clone
git clone https://github.com/Ashm1t/Libra.git
cd Libra

# Configure environment
cp .env.example .env
# Edit .env — at minimum set your GROQ_API_KEY
```

Edit `.env` and set:
```env
NEXT_PUBLIC_WS_URL=http://localhost       # or your server IP/domain
FRONTEND_URL=http://localhost             # same as above
GROQ_API_KEY=your_key_here               # required
```

Leave `MONGODB_URI`, `REDIS_URL`, `API_URL`, and `PORT` as defaults — they point to the Docker containers automatically.

```bash
# Start all services (frontend, backend, MongoDB, Redis, Nginx)
docker-compose up -d --build

# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f backend    # backend logs
docker-compose logs -f frontend   # frontend logs

# Stop everything
docker-compose down

# Restart a single service (e.g., after changing .env)
docker-compose up -d --force-recreate backend
```

Open [http://localhost](http://localhost)

**What Docker runs for you:**

| Container | What it does |
|-----------|-------------|
| `nginx` | Reverse proxy on port 80, routes traffic to frontend and backend |
| `frontend` | Next.js app |
| `backend` | Express API + BullMQ worker + TeX Live (pdflatex) |
| `mongodb` | Database (data persists in a Docker volume) |
| `redis` | Job queue for background PDF generation |

---

## CI/CD

Every push to `main` triggers GitHub Actions, which SSHs into the EC2 instance and runs:

```bash
git pull origin main
docker-compose up --build -d
docker image prune -f
```

---

## License

MIT
