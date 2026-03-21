# VedaAI

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
git clone https://github.com/Ashm1t/VedaAI.git
cd VedaAI

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

### Docker (Production)

```bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d --build
```

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
