# Redesign Handoff — Open-Source / Local-First UI

Authored by Claude Sonnet 4.5 | Date: 2026-04-26

---

## What This Handoff Covers

This document describes a UI redesign pass that was completed in this session.
The goal was to reposition Libra from a gated SaaS product (email waitlist → Google OAuth → app) into an open-source, local-first tool where anyone can open the editor immediately with no account required.

---

## Design Principles Applied

1. **Zero friction entry** — the app opens directly. No login wall, no waitlist, no email form.
2. **Local-first language** — copy and UI signals make clear that files stay on the user's machine.
3. **Single accent color** — the previous design used `#1DB954` (Spotify green) on the landing and `#4C8DFF` (blue) inside the app. These are now unified to `#4C8DFF` blue everywhere.
4. **Minimal chrome** — the wide floating pill sidebar (304px) is replaced with a 52px icon rail. Maximum space goes to the editor, not the shell.
5. **No dead nav items** — "My Groups" and "AI Teacher's Toolkit" coming-soon stubs are removed entirely.

---

## Files Changed

### `src/app/page.tsx` — Landing page (full rewrite)

**Removed:**
- Waitlist email form and submission logic (`WaitlistSection` component)
- Google OAuth / login redirect flow
- "Now in early access" badge
- All `#1DB954` green styling
- "Log in" links from navbar, hero, and footer
- `waitlistRef` scroll target

**Added / Changed:**
- `OpenSourceCTA` component replaces `WaitlistSection` — simple "Open editor. No sign-up required." with two buttons: "Open editor →" (`/agent`) and "Star on GitHub"
- Hero heading changed to: *"A document editor that writes with you."*
- Hero subhead: *"Libra is an open-source AI workspace for creating and editing LaTeX documents. No account. No subscription. Your files stay on your machine."*
- Navbar right side: single "Open editor →" blue pill, no login link
- App mockup updated: browser bar shows `libr4.strangled.net/agent`, sidebar shows icon rail design, PDF pane has "Save to disk" label
- How It Works step 3 copy changed from "Download as PDF" to "Save to your disk" (local-first framing)
- Footer: removed login link, now says "Open-source AI document editor · MIT License"
- All accent colors switched from `#1DB954` to `#4C8DFF`

### `src/components/layout/Sidebar.tsx` — Full rewrite

**Old design:** 304px floating pill sidebar, heavy drop shadow, rounded-2xl, user profile card at bottom, logout button, "My Groups" and "AI Teacher's Toolkit" coming-soon nav items, "Open Agent" primary CTA button, assignment count badge.

**New design:** 52px fixed icon rail.

Key details:
- `width: 52px`, `height: 100vh`, `position: fixed`, `left: 0`, `top: 0`
- `bg-[#0d0d0d]`, `border-r border-[#1e1e1e]` — no shadow, no floating
- Icons only on desktop. Tooltip appears on hover via `RailTooltip` component (positioned `left: calc(100% + 8px)`, `opacity-0 group-hover:opacity-100`)
- Nav items: **Home** (`/`), **Agent** (`/agent`), **Documents** (`/legacy`)
- Bottom items: **Local workspace** indicator (folder icon, non-clickable, tooltip says "files stay on your machine"), **Settings** (`/settings`)
- Active state: `bg-[#1e2a3a] text-[#4C8DFF]` — blue tint background, blue icon
- Inactive state: `text-[#555] hover:bg-[#1a1a1a] hover:text-[#bbb]`
- Mobile prop still supported — renders a 260px slide-in drawer with icons + labels + close button
- All icons are 18×18 stroke-based SVGs
- `getIsActive()` helper handles path prefix matching (e.g. `/legacy`, `/assignments`, `/library` all activate the Documents item)

### `src/app/agent/layout.tsx` — Updated

**Removed:** `AuthGuard` wrapper, desktop sidebar toggle button and toggle state (`sidebarVisible`), chevron toggle logic, conditional `md:ml-[328px]` / `md:ml-3` transition.

**Changed:**
- Main content margin: `md:ml-[52px]` (fixed, no toggle)
- Mobile top bar: hamburger button opens drawer sidebar, simpler markup, uses `bg-[#0d0d0d]` instead of `#121212`
- Sidebar drawer width: `w-[260px]` (was `w-[280px]`)

### `src/app/assignments/layout.tsx` — Updated

**Removed:** `AuthGuard` wrapper.

**Changed:**
- Main content: `md:ml-[52px]` (was `md:ml-[328px]`), `md:pt-6 md:pb-6 md:px-6` (was `md:pt-[78px]`)
- Mobile top bar color: `bg-[#0d0d0d]` (was `#121212`)
- Mobile top bar logo: uses hamburger + "Libra" text (removed notification bell icon)
- Sidebar drawer width: `w-[260px]`

### `src/app/settings/layout.tsx` — Updated

Same changes as assignments layout above.

### `src/app/library/layout.tsx` — Updated

Same changes as assignments layout above.

### `src/components/layout/MobileNav.tsx` — Updated

**Removed:** "Toolkit" tab (was linking to `/coming-soon`)

**Changed:**
- Tabs: Home, Agent, Documents, Settings (4 real destinations, no dead links)
- Inactive color: `#444` (was `#727272`) — slightly darker, matches new palette
- Active color: `#4C8DFF` (unchanged)
- Background: implied by parent layout — now `bg-[#0d0d0d]` consistent with rail

---

## What Was NOT Changed

These files are untouched and remain as-is:

- `src/app/login/page.tsx` — login page still exists (can be reached directly at `/login`, but nothing links to it from the main UI anymore)
- `src/components/auth/AuthGuard.tsx` — still exists, just not used in any layout
- `server/` — entire backend untouched
- `src/store/authStore.ts` — still exists
- `src/app/agent/page.tsx` — agent split-pane layout untouched
- `src/components/agent/*` — all agent UI components untouched
- `src/app/globals.css` — untouched
- `packages/` — untouched

---

## Color Reference

| Token | Value | Usage |
|---|---|---|
| Page background | `#0d0d0d` | Landing page, rail, mobile bars |
| Surface | `#121212` / `#181818` | App content areas (existing, unchanged) |
| Card | `#1a1a1a` | Rail hover, tooltip background |
| Border | `#1e1e1e` | Rail border, mockup borders |
| Primary accent | `#4C8DFF` | All CTAs, active nav, badges |
| Primary hover | `#3977EA` | Button hover state |
| Active nav bg | `#1e2a3a` | Rail active item background |
| Text primary | `#ffffff` | Headings |
| Text secondary | `#555` / `#888` | Body copy, subtitles |
| Text muted | `#333` / `#444` | Footer, inactive nav icons |

---

## Recommended Next Steps

### Immediate

- **Wire the GitHub link** — `src/app/page.tsx` has `href="https://github.com"` as a placeholder in two places (hero + CTA section). Replace with the actual repo URL.
- **Remove `src/app/login/page.tsx`** (optional) — or keep it for self-hosted deployments where the owner wants auth. Right now it's an orphan page that nothing links to.
- **Remove `AuthGuard` component** (optional) — `src/components/auth/AuthGuard.tsx` is no longer used anywhere. Can be deleted or kept if auth is ever re-added.

### Polish

- **Favicon** — currently uses `libra.png`. Consider a proper 32×32 favicon that works on the `#0d0d0d` background.
- **OG image / meta** — `src/app/layout.tsx` has a placeholder description. Update for the new open-source framing.
- **Landing page mockup** — the desktop mockup in `AppMockup()` is hand-coded HTML. Consider replacing with an actual screenshot once the UI is stable.
- **`/coming-soon` route** — `src/app/coming-soon/page.tsx` still exists. Can be removed since nothing links to it now.

### Architecture

- The `agentStore` still calls `initializeSession()` which hits the authenticated backend. For a truly open local-first flow, this session init should work without a JWT (or fall back gracefully). See `server/src/index.ts` line where agent routes are mounted — `requireAuth` middleware is still active on the backend for agent routes.
- If auth is being dropped from the product permanently, strip `authStore`, `authHeaders()`, and the Google OAuth server routes to reduce dead code surface.

---

## Verification Done

- `npx tsc --noEmit` — passed with zero errors on frontend
- Grep for `AuthGuard`, `#1DB954`, `ml-[328px]` across `src/` — zero matches
- Dev server confirmed running at `http://localhost:3000` via `npm run dev`

---

## Addendum 2026-04-26: Agent System Expansion

This section captures the next architectural direction after the UI redesign. Libra is now an agent-first document workspace, not an assignment-generator product with an agent bolted on. The goal is to turn `/agent` into a conversational LaTeX workspace that can ingest source material, select the right template family, ask targeted clarifying questions, build structured LaTeX, compile to PDF, and repair formatting with minimal wasted context.

The local `claude-code` reference repo was reviewed for architectural patterns. We should borrow ideas, not implementation: tool registries, command registries, permission gates, MCP connection boundaries, task/coordinator separation, compact activity logs, and memory directories are all useful patterns for Libra.

### Recommended Agent Stack

Use the LangChain ecosystem as the agent runtime spine:

- **LangGraph for orchestration:** model the document workflow as a stateful graph with explicit nodes for intent detection, ingestion, retrieval, clarification, building, compile, repair, and export. LangGraph is the right fit because Libra needs durable state, streaming progress, human-in-the-loop checkpoints, and predictable routing rather than a single loose prompt loop.
- **LangChain for tool calling:** wrap internal capabilities such as PDF extraction, DOCX extraction, OCR, template retrieval, LaTeX compile, source patching, MCP calls, and export as typed tools. LangChain tools give the agents a common language for invoking capabilities without stuffing all implementation details into prompts.
- **LangSmith for MLOps and observability:** trace each user turn, graph node, model call, tool call, retrieval result, compile attempt, and repair pass. This becomes the debugging black box when the agent creates malformed LaTeX, picks the wrong template, wastes tokens, or asks poor clarifying questions.

Plain-language comparison: LangGraph is the railway map, LangChain tools are the stations and machines each train can use, and LangSmith is the control-room recording that shows exactly where a trip slowed down or derailed.

Recommended runtime shape:

```text
Frontend /agent
  -> server Agent API
  -> LangGraph DocumentGraph
      -> Intent node
      -> IngestionAgent node
      -> RetrievalAgent node
      -> Clarification node
      -> LatexBuilderAgent node
      -> CompileTool node
      -> Repair node
      -> Export node
  -> LangSmith traces each node/tool/model call
```

Use a graph-first approach instead of a fully autonomous free-for-all:

- The coordinator should be a LangGraph state machine, not just another chatty agent.
- Specialist agents can be LangGraph nodes or LangChain subagents exposed as tools.
- Repeated work should reuse graph state instead of re-sending full history.
- Human checkpoints should appear before expensive operations, source overwrite, external MCP calls, or major template switches.
- LangSmith tags should include `sessionId`, `mode`, `templateId`, `graphNode`, `compileStatus`, and `retrievalTopK` so failures are searchable later.

### 1. PDF Ingestion With Source Recovery

PDF ingestion should not only OCR visible text. It should first try to recover or infer source material, because source-aware edits are much higher quality than PDF-text edits.

Recommended ingestion order:

- Libra-generated PDF: if the PDF came from Libra, resolve it through the artifact store and load the original `.tex`, `.bib`, assets, compile logs, and template id directly. No OCR should be needed.
- Embedded source attachments: inspect the PDF for embedded files such as `.tex`, `.bib`, `.sty`, `.cls`, `.md`, `.txt`, images, or zipped source bundles.
- Text-layer extraction: extract selectable text and detect LaTeX-like source markers such as `\documentclass`, `\begin{document}`, `\section`, `\usepackage`, bibliography blocks, and package names.
- Structure reconstruction: if source is not present, infer a document outline from headings, page layout, tables, references, and repeated sections. Mark this as reconstructed context, not trusted source.
- OCR fallback: for scanned PDFs or images, run OCR page by page and preserve page numbers, bounding boxes, confidence scores, and reading order.
- DOCX and image parity: DOCX should follow the same ingestion contract using `mammoth` for text/structure, plus image extraction when present. Images should use OCR and optional layout classification.

The output of ingestion should be a compact `IngestionPacket`, not raw full text dumped into the builder prompt:

```ts
type IngestionPacket = {
  sourceKind: "libra_artifact" | "pdf_embedded_source" | "pdf_text_layer" | "pdf_ocr" | "docx" | "image" | "manual";
  confidence: "high" | "medium" | "low";
  sourceFiles: Array<{ path: string; language: "latex" | "bibtex" | "markdown" | "text" | "asset"; artifactId: string }>;
  documentOutline: Array<{ title: string; level: number; page?: number; sourceRef?: string }>;
  extractedFields: Record<string, string | string[]>;
  warnings: string[];
};
```

This lets the agent say "I found a real `.tex` source" versus "I reconstructed this from PDF text", which matters for how boldly it should edit.

### 2. Agent Workspace Overhaul Recommendations

The `/agent` workspace should feel like a focused document cockpit:

- Conversation pane: default entry point. Conversational by default. It should only trigger template cards, form fields, or planning UI after intent detection.
- Source pane: toggleable `.tex` / `.md` / extracted source editor. Hidden until useful, but available when the user wants direct control.
- PDF pane: compiled preview with download, compile status, page navigation, and error anchors.
- Activity rail: compact log of tool calls, retrieval hits, compile attempts, repairs, and MCP calls. This is inspired by Claude Code's visible tool-call rhythm without making the UI bulky.
- Artifact drawer: previous PDFs, source versions, diffs, compile logs, and generated assets.
- Mode selector: six scoped modes plus sandbox mode. Modes constrain retrieval, templates, renderer rules, and available tools. Sandbox mode remains mode-agnostic.

Recommended slash commands for power users:

- `/ingest` to import PDF, DOCX, image, Markdown, or LaTeX source.
- `/template` to force template selection or show candidates.
- `/compile` to compile the current source.
- `/fix` to repair compile/layout issues.
- `/export` to package PDF/source/assets.
- `/mcp` to inspect connected MCP servers and tools.

The UI should show the agent's working state as a small pipeline rather than large cards:

```text
Intent -> Ingest -> Retrieve -> Clarify -> Build -> Compile -> Repair -> Export
```

### 3. Multi-Agent Orchestration

Use three specialist agents coordinated by a deterministic orchestrator. The coordinator owns routing, budgets, artifacts, and tool permissions. The specialist agents should exchange compact typed packets and artifact ids, not full conversation dumps.

#### Agent A: IngestionAgent

Responsibilities:

- Classify user input and uploaded files.
- Extract PDF/DOCX/image/Markdown/LaTeX content.
- Recover source code when possible.
- Extract fields, outline, constraints, citations, tables, assets, and missing information.
- Produce `IngestionPacket` plus artifact ids for large payloads.

Token rule: summarize aggressively. Store full extracted text/source in artifacts, pass only outline, field map, and source references downstream.

#### Agent B: RetrievalAgent

Responsibilities:

- Search mode-scoped RAG memory and template catalog.
- Return candidate templates, style families, renderer adapters, and examples.
- Rerank candidates by intent, compile reliability, slot coverage, package availability, and prior success.
- Provide only top candidates first; fetch full template only after selection.

Token rule: return `TemplateShortlist` with ids and summaries. Do not pass full templates unless the builder requests one selected template.

```ts
type TemplateShortlist = {
  mode: string;
  candidates: Array<{
    templateId: string;
    name: string;
    score: number;
    reasons: string[];
    requiredFields: string[];
    compileProfileId: string;
    rendererAdapterId: string;
  }>;
  clarifyingQuestions: string[];
};
```

#### Agent C: LatexBuilderAgent

Responsibilities:

- Ask targeted clarifying questions when required fields are missing.
- Generate or modify `.tex`, `.bib`, Markdown source, and assets.
- Use renderer adapters instead of freehanding every structure.
- Compile, read errors, patch source, and retry within a bounded repair loop.
- Return human-readable response plus artifact ids for source/PDF/logs.

Token rule: builder receives the selected template id, compact field map, selected snippets, and source references. It should pull exact source/template artifacts through tools only when needed.

#### Coordinator

The coordinator is the traffic controller. It should not be a creative writer.

Responsibilities:

- Detect intent: chat-only, ingest, create, edit, compile, repair, export, or tool call.
- Maintain session state and artifact graph.
- Route tasks to specialist agents.
- Enforce token budgets and mode boundaries.
- Decide when to ask the user questions.
- Surface tool activity to the UI.

Recommended flow:

```text
User message/upload
  -> Coordinator intent detection
  -> IngestionAgent if files/source/context are present
  -> RetrievalAgent if document creation/editing needs templates or memory
  -> Coordinator asks clarification only if required fields are missing
  -> LatexBuilderAgent writes/patches source
  -> Compile tool validates PDF
  -> Repair loop if bounded compile/layout errors occur
  -> UI receives message + PDF/source artifacts
```

### 4. RAG Memory Improvements

RAG memory should become a structured document intelligence layer, not just vector search over raw template text.

Recommended memory spaces:

- Template catalog: one record per template with metadata, mode, document type, style, engine, class, packages, assets, required fields, optional fields, section schema, renderer adapter, and compile profile.
- Template chunks: separate embeddings for visual description, layout intent, section schema, package requirements, example usage, and known failure modes.
- Rendered examples: successful generated outputs linked to prompts, selected template, field values, compile logs, and user acceptance.
- Compile memory: known package conflicts, missing asset fixes, overfull box fixes, BibTeX/Biber requirements, engine requirements, and repair recipes.
- User/project memory: persistent style preferences, names, organizations, recurring document details, and accepted phrasing.
- Mode memory: each of the six modes has scoped retrieval. Sandbox mode can search all memory but should clearly label cross-mode matches.

Template selection should use hybrid scoring:

```text
final_score =
  semantic_similarity
  + mode_match
  + required_field_coverage
  + compile_health
  + renderer_adapter_fit
  + recent_success_bonus
  - missing_dependency_penalty
```

Each template should have a renderer adapter. The builder should not invent every layout from scratch. It should fill named slots, insert sections through deterministic helpers, and only free-write content inside safe regions.

Example template memory record:

```ts
type TemplateMemoryRecord = {
  templateId: string;
  mode: "resume" | "research" | "assignment" | "letter" | "report" | "presentation" | "sandbox";
  documentClass: string;
  engine: "pdflatex" | "xelatex" | "lualatex";
  requiredPackages: string[];
  requiredFields: string[];
  optionalFields: string[];
  sectionSchema: string[];
  rendererAdapterId: string;
  compileHealth: number;
  knownFailureModes: string[];
};
```

### 5. General Tools And MCP Connectivity

Libra needs a first-class tool layer before MCP is exposed to the agent. The useful pattern from `claude-code` is: typed tools, schema validation, permissions, registry, activity UI, and service boundaries.

Recommended internal tool contract:

```ts
type AgentTool<Input, Output> = {
  name: string;
  description: string;
  inputSchema: unknown;
  isReadOnly: boolean;
  requiresPermission: boolean;
  tokenCostHint: "small" | "medium" | "large";
  run(input: Input, context: ToolContext): Promise<Output>;
};
```

Initial tool groups:

- Source tools: `read_source`, `write_source`, `diff_source`, `list_artifacts`, `create_artifact_snapshot`.
- Ingestion tools: `extract_pdf`, `extract_pdf_attachments`, `extract_docx`, `ocr_image`, `detect_latex_source`.
- Retrieval tools: `search_templates`, `get_template_summary`, `get_template_source`, `rerank_templates`, `search_project_memory`.
- Build tools: `validate_latex`, `compile_latex`, `extract_compile_errors`, `autofix_latex`.
- Export tools: `download_pdf`, `export_source_zip`, `export_project_bundle`.
- MCP tools: `list_mcp_servers`, `list_mcp_tools`, `call_mcp_tool`, `read_mcp_resource`.

MCP integration should sit behind a backend service, not directly inside UI components.

Recommended MCP architecture:

```text
server/src/services/mcp/
  McpConnectionManager.ts
  McpServerRegistry.ts
  McpToolAdapter.ts
  McpPermissionPolicy.ts
  mcpConfig.ts
```

Config sources:

- Project config: `.libra/mcp.json`
- User config: local machine config for private tools
- Environment variables for secrets

MCP safety rules:

- Read-only MCP tools can run with lightweight confirmation or auto mode.
- Mutating/external tools require explicit permission unless trusted.
- Tool descriptors can enter prompts; large tool results should be stored as artifacts and summarized.
- Every MCP call should appear in the activity rail with server, tool name, status, duration, and artifact id.

The coordinator should expose MCP tools selectively by mode. For example, resume mode may only need local file/search tools, while research mode may use citation, arXiv, or browser MCP servers.

### Implementation Order

1. Add artifact/source model so PDFs, `.tex`, `.bib`, logs, extracted text, and template ids are linked.
2. Add internal `AgentTool` registry and move compile/retrieval/ingestion operations behind tools.
3. Build `IngestionAgent`, `RetrievalAgent`, `LatexBuilderAgent`, and deterministic `DocumentCoordinator` contracts.
4. Add structured template memory records and rebuild embeddings from `C:\R\Veda\templates\scraped` with mode/template metadata.
5. Add source recovery for Libra-generated PDFs first, then embedded PDF source extraction, then text extraction, then OCR fallback.
6. Add MCP connection manager with read-only tools first.
7. Expose the new flow in `/agent` through compact activity logs, template cards on intent trigger, source editor toggle, and artifact history.
