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
- **LaTeX PDF Compilation** (My solution to pdf generation of this sort, i use this with resumes as well) — Generates professional, print-ready PDFs using LaTeX templates
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
The user uploads the source material > The ocr scans for texts (currently using llama scout) takes chunks out, The form details and the relevant sourced chunks are passed in a feedforward fashion to the LLM, The LLM is then instructed to choose the best possible latex template already available to build upon, These templates i have collected from overleaf's website icse board papers and cbse papers as well, Formatting handbook and how to use templates to create paper is written in a detailed but efficient system prompt that goes in the next pass, After that the question paper is generated in latex and then compiled using pdflatex to a pdf that can be downloaded. Have tried to make the pdfs look exactly as unit tests/exams formatting 

here is a flowchart of the process : 
┌─────────────────────────────────────────────────────────────┐
│                    USER SUBMITS FORM                        │
│  Subject, Class, Topic, Due Date, Question Types, Files     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [5%]
┌─────────────────────────────────────────────────────────────┐
│                 1. LOAD ASSIGNMENT                           │
│  MongoDB lookup by assignmentId                             │
│  Extract formData + uploadedFilePaths                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [10%]
┌─────────────────────────────────────────────────────────────┐
│                    2. OCR (if files)                         │
│  For each uploaded file:                                    │
│    .png/.jpg → Groq Vision (Llama 4 Scout) → text           │
│    .txt      → read directly                                │
│  Join all with "---" separator                              │
│                                                             │
│  ~1-2K tokens per image  ·  ~500 tokens out                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [25%]
┌─────────────────────────────────────────────────────────────┐
│              3. ANALYZE SOURCE MATERIAL                      │
│  buildAnalysisPrompt(extractedText, formData)               │
│  Groq JSON call → llama-3.3-70b-versatile                   │
│                                                             │
│  Output:                                                    │
│  ┌────────────────────────────────────────────┐             │
│  │ {                                          │             │
│  │   subject: "Science",                      │             │
│  │   topic: "Forces and Motion",              │             │
│  │   keyConcepts: ["friction", "gravity"...], │             │
│  │   keyTerms: ["Newton", "inertia"...],      │             │
│  │   difficultyGuide: "...",                  │             │
│  │   detectedSchoolName: "DPS R.K. Puram"     │             │
│  │ }                                          │             │
│  └────────────────────────────────────────────┘             │
│  ~2K tokens in  ·  ~500 tokens out                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [25-50%]
┌─────────────────────────────────────────────────────────────┐
│         4. GENERATE SECTIONS (PARALLEL)                      │
│                                                             │
│  For each questionType in formData.questionTypes:           │
│  buildSectionPrompt() → Groq JSON call                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Section A │  │ Section B │  │ Section C │  │ Section D │   │
│  │   MCQ     │  │   Fill    │  │   Short   │  │   Long    │   │
│  │  5 × 1m   │  │  3 × 1m   │  │  3 × 2m   │  │  2 × 4m   │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │             │             │             │          │
│        └──────┬──────┴──────┬──────┴──────┬──────┘          │
│               │  Promise.all (concurrent)  │                │
│               ▼                            ▼                │
│  Each returns: { label, title, instruction, questions[] }   │
│                                                             │
│  ~1.5K tokens in × N sections  ·  ~1K tokens out each       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            5. SELECT TEMPLATE                                │
│  selectTemplate(formData)                                   │
│                                                             │
│  subject contains "literature"? ──yes──▶ icse_english_      │
│         │                                literature.tex     │
│         no                                                  │
│         ▼                                                   │
│  questionpaper.tex  (default)                               │
│                                                             │
│  No API call — pure keyword match                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            6. ASSEMBLE QUESTION DATA                         │
│                                                             │
│  ┌──────────────────────────────────────────┐               │
│  │ QuestionPaperOutput {                    │               │
│  │   schoolName, subject, className,        │               │
│  │   timeAllowed: "45 minutes",             │               │
│  │   maximumMarks: 30,                      │               │
│  │   generalInstruction: "...",             │               │
│  │   sections: [A, B, C, D],               │               │
│  │   aiSummary: "Generated a Science..."    │               │
│  │ }                                        │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
│  Validates: marks add up, sections non-empty                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [55%]
┌─────────────────────────────────────────────────────────────┐
│              7. GENERATE LATEX                                │
│  Load template .tex source + handbook.md                    │
│  buildLatexGenerationPrompt(template, handbook, questions)  │
│  Groq TEXT call → llama-3.3-70b-versatile (temp=0.3)        │
│                                                             │
│  Input: full template preamble + all questions + rules      │
│  Output: complete compilable .tex file                      │
│                                                             │
│  ~12K tokens in  ·  ~4K tokens out  ← BIGGEST CALL         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [65%]
┌─────────────────────────────────────────────────────────────┐
│           8. VALIDATE + AUTO-FIX                             │
│                                                             │
│  autoFixLatex():                                            │
│    ✓ Strip markdown fences (```latex...```)                  │
│    ✓ Fix double-escaped commands (\\\\begin → \\begin)       │
│    ✓ Remove \includegraphics / \img calls                   │
│    ✓ Balance unclosed { braces }                            │
│    ✓ Fix unmatched \begin{env} / \end{env}                  │
│                                                             │
│  validateLatex():                                           │
│    ✓ \documentclass present?                                │
│    ✓ \begin{document} + \end{document} matched?            │
│    ✓ Brace balance = 0?                                    │
│    ✓ All environments matched?                              │
│    ✓ No \usepackage after \begin{document}?                │
│                                                             │
│  No API call — deterministic                                │
│                                                             │
│        PASS ──────────────────────▶ Step 9                  │
│        FAIL ──▶ AI Fix (Groq) ──▶ re-validate ──▶ Step 9   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [75%]
┌─────────────────────────────────────────────────────────────┐
│            9. COMPILE PDF                                    │
│                                                             │
│  Write paper.tex → output/<assignmentId>/paper.tex          │
│  pdflatex pass 1 (references)                               │
│  pdflatex pass 2 (cross-refs)                               │
│                                                             │
│        SUCCESS ──▶ paper.pdf ──▶ Step 10                    │
│        FAIL ──▶ AI Fix (Groq) ──▶ recompile                │
│                    FAIL again ──▶ save without PDF           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [95%]
┌─────────────────────────────────────────────────────────────┐
│            10. SAVE OUTPUT                                   │
│                                                             │
│  QuestionPaperOutputModel.create({                          │
│    assignmentId, sections, latexSource,                     │
│    latexTemplateName, pdfPath, aiSummary                    │
│  })                                                         │
│                                                             │
│  Assignment.status = "generated"                            │
│  Assignment.outputId = output._id                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼  [100%]
┌─────────────────────────────────────────────────────────────┐
│            WebSocket → "done"                                │
│  Frontend receives completion, navigates to output view     │
└─────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════
  TOKEN BUDGET (typical 30-mark paper, 4 sections):

  OCR (1 image)          ~2,500 tokens
  Analyze                ~2,500 tokens
  Sections (4 parallel)  ~10,000 tokens
  LaTeX generation       ~16,000 tokens
  AI fix (if needed)     ~4,000 tokens
  ─────────────────────────────────
  TOTAL                  ~25-30K tokens
  
  Groq API calls: 6-8 (OCR + analyze + 4 sections + LaTeX + fix)
  Wall time: ~15-25 seconds
═══════════════════════════════════════════════════════════════

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

### Docker (No Dependencies Required)

If you don't want to install MongoDB, Redis, or TeX Live locally, use Docker — it bundles everything for you.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

```bash
# Clone
git clone https://github.com/Ashm1t/VedaAI.git
cd VedaAI

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
