# Agent Change Notes

## Date
- 2026-04-02

## Goal
- Build an additive `/agent` integration path without modifying the existing assignment generator pipeline.
- Keep the old assignment flow intact while creating a parallel agent session backend and wiring the current `/agent` page to it.

## What Changed

### Backend
- Added a dedicated agent session model:
  - [server/src/models/AgentSession.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/models/AgentSession.ts)
- Added a dedicated agent artifact model:
  - [server/src/models/AgentArtifact.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/models/AgentArtifact.ts)
- Added additive agent service logic:
  - [server/src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentService.ts)
- Added agent controllers:
  - [server/src/controllers/agentController.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/controllers/agentController.ts)
- Added new agent routes:
  - [server/src/routes/agentRoutes.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/routes/agentRoutes.ts)
- Registered the new route tree in:
  - [server/src/index.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/index.ts)

### Frontend
- Added agent API client:
  - [src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/services/agentService.ts)
- Added agent Zustand store:
  - [src/store/agentStore.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/store/agentStore.ts)
- Extended shared frontend types with agent session/message/artifact types:
  - [src/types/index.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/types/index.ts)
- Extended websocket client helpers with agent session listeners:
  - [src/services/wsService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/services/wsService.ts)
- Wired `/agent` page to initialize a session and subscribe to agent events:
  - [src/app/agent/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/agent/page.tsx)
- Reworked the chat panel to render live session messages and send prompts:
  - [src/components/agent/ChatPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/ChatPanel.tsx)
- Reworked the PDF preview to prefer generated artifact PDFs when available, but fall back to the sample resume:
  - [src/components/agent/PdfPreview.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/PdfPreview.tsx)

## New Backend Contract

### Routes
- `POST /api/agent/sessions`
- `GET /api/agent/sessions/:id`
- `POST /api/agent/sessions/:id/messages`
- `GET /api/agent/sessions/:id/artifacts/latest`
- `GET /api/agent/artifacts/:id/pdf`

### Socket Events
- `agent:status`
- `agent:message`
- `agent:artifact`

### Current Behavior
- Opening `/agent` creates or restores an `AgentSession`.
- Sending a prompt persists a user message and triggers async backend processing.
- Backend emits status/message/artifact events for that session.
- The current backend response path is additive scaffolding:
  - It is session-aware.
  - It uses a Groq-backed assistant response when `GROQ_API_KEY` is configured.
  - It does **not** yet run the full future LaTeX editing orchestration.
- The PDF preview still falls back to `Jake_s_Resume.pdf` unless a real generated PDF artifact exists.

## What Was Intentionally Left Untouched
- No modifications to:
  - assignment routes
  - assignment controllers
  - assignment models
  - question paper output flow
  - BullMQ generation queue

The old assignment generator path should continue behaving as before.

## Important Caveats
- The new `/agent` backend is a parallel session architecture, not the final concrete agent backend.
- Artifact PDFs are supported structurally, but the current additive backend does not yet create real compiled PDF artifacts.
- The current preview therefore usually shows the sample resume fallback.
- The existing `@libra/core` path is still question-paper-oriented, so I did not jam `/agent` prompts through the assignment pipeline.

## Best Next Steps
- Add a real `agentService` orchestration path that transforms prompt + session state into:
  - updated LaTeX
  - optional compiled PDF
  - versioned artifact records
- Decide whether the agent should:
  - call lower-level core helpers
  - or get a new core API separate from `AssignmentFormData`
- Add session-scoped source document upload/attachment support for `/agent`
- Expose artifact history, not just latest artifact
- Decide whether `currentTex` should be editable in a hidden or future editor surface

## Verification
- Frontend type-check passed:
  - `npm exec tsc --noEmit`
- Server type-check passed:
  - `npm --prefix server exec tsc --noEmit`

## Update 2026-04-03

### Guided Workflow Added
- `/agent` no longer has to jump straight from a user prompt to a draft.
- The backend can now pause in a guided state, shortlist templates, ask clarification questions, and wait for structured answers before generating LaTeX.

### New Backend Pieces
- Added guided-workflow helpers in:
  - [server/src/services/agentWorkflowService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentWorkflowService.ts)
- Extended retrieval for shortlist UX and explicit template selection in:
  - [server/src/services/templateRetrievalService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/templateRetrievalService.ts)
- Extended session persistence with workflow state in:
  - [server/src/models/AgentSession.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/models/AgentSession.ts)
- Updated orchestration in:
  - [server/src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentService.ts)

### New Frontend Behavior
- The chat panel now renders:
  - template shortlist cards
  - clarification fields
  - optional extra notes
  - a guided `Generate draft` action
- The store and websocket client now track full session updates, not just status/messages/artifacts.

Updated frontend files:
- [src/components/agent/ChatPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/ChatPanel.tsx)
- [src/store/agentStore.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/store/agentStore.ts)
- [src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/services/agentService.ts)
- [src/services/wsService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/services/wsService.ts)
- [src/app/agent/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/agent/page.tsx)
- [src/types/index.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/types/index.ts)

### Retrieval / Template Use Now
- Retrieval is treated more like template selection than blind prompt stuffing.
- The backend now stores shortlist metadata suitable for UI display.
- A selected template id can be sent back from the UI and resolved directly for generation.
- The chosen template is then used as a skeleton while answers are merged into a structured plan before drafting.

### Important Notes For Continuation
- The guided flow currently asks deterministic mode-specific questions.
- Resume, research-paper, presentation, and generic flows are covered.
- The next strong improvement would be mode-specific renderers/adapters so content insertion becomes even less LLM-freeform after template selection.
- Root app type-check now excludes the nested [open-multi-agent](c:/R/Veda/.claude/worktrees/keen-neumann/open-multi-agent) repo so Libra verification is not polluted by the other repo's missing dependencies.

### Verification After Guided Workflow
- Root app type-check passed:
  - `npm exec tsc --noEmit`
- Server type-check passed:
  - `npm exec tsc --noEmit` run from [server](c:/R/Veda/.claude/worktrees/keen-neumann/server)

## Update 2026-04-05

### Conversational Intent Gate Added
- `/agent` is no longer forced into template/clarification mode for every turn.
- A new intent layer now decides whether the user is:
  - just chatting
  - creating a document
  - editing a document
  - asking the agent to ingest source material

Files:
- [server/src/services/agentIntentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentIntentService.ts)
- [server/src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentService.ts)

### 6-Mode Plus Sandbox Registry Added
- Added a canonical mode registry for:
  - `resume_cv`
  - `research_paper`
  - `report_article`
  - `letter_application`
  - `slides_presentation`
  - `worksheet_exam`
  - `sandbox`
- This is now the foundation for mode-scoped retrieval and future mode-specific renderers.

Files:
- [server/src/services/agentModeRegistry.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentModeRegistry.ts)
- [server/src/services/agentWorkflowService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentWorkflowService.ts)

### Source Ingestion Added For Agent Sessions
- Added additive source ingestion for `/agent` sessions.
- New upload path supports:
  - PDF
  - DOCX
  - TXT / MD
  - PNG / JPG / JPEG / WEBP
- Ingested text is stored into session context so the agent can use it conversationally and during drafting.

Files:
- [server/src/services/agentDocumentIngestionService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/services/agentDocumentIngestionService.ts)
- [server/src/middleware/agentUpload.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/middleware/agentUpload.ts)
- [server/src/models/AgentSession.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/models/AgentSession.ts)
- [server/src/controllers/agentController.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/controllers/agentController.ts)
- [server/src/routes/agentRoutes.ts](c:/R/Veda/.claude/worktrees/keen-neumann/server/src/routes/agentRoutes.ts)

### Frontend Upload Support Added
- The chat panel now has an attach button for session-scoped sources.
- Uploaded files appear in a `Source Context` block inside the chat panel.

Files:
- [src/components/agent/ChatPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/ChatPanel.tsx)
- [src/store/agentStore.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/store/agentStore.ts)
- [src/services/agentService.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/services/agentService.ts)
- [src/types/index.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/types/index.ts)

### Important Current Limitation
- PDF extraction now works for PDFs with embedded text.
- DOCX extraction is now handled through `mammoth`.
- Image OCR still uses the Groq vision OCR path.
- Scanned PDFs without embedded text still need a page-to-image OCR fallback later.

### Extra Verification
- Root app type-check passed:
  - `npm exec tsc --noEmit`
- Server type-check passed:
  - `npm exec tsc --noEmit` run from [server](c:/R/Veda/.claude/worktrees/keen-neumann/server)
- Smoke test passed for PDF ingestion on [Jake_s_Resume.pdf](c:/R/Veda/.claude/worktrees/keen-neumann/public/Jake_s_Resume.pdf)

## Update 2026-04-14

### Assignment Generator Moved Behind Legacy Routes
- The old assignment product is now preserved under:
  - [src/app/legacy/assignments/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/legacy/assignments/page.tsx)
  - [src/app/legacy/assignments/create/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/legacy/assignments/create/page.tsx)
  - [src/app/legacy/assignments/[id]/output/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/legacy/assignments/[id]/output/page.tsx)
  - [src/app/legacy/library/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/legacy/library/page.tsx)
- Shared legacy page implementations were extracted to:
  - [src/legacy/assignment-generator/pages/AssignmentsPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/AssignmentsPage.tsx)
  - [src/legacy/assignment-generator/pages/CreateAssignmentPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/CreateAssignmentPage.tsx)
  - [src/legacy/assignment-generator/pages/AssignmentOutputPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/AssignmentOutputPage.tsx)
  - [src/legacy/assignment-generator/pages/LibraryPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/LibraryPage.tsx)
- Legacy routes use their own preserved shell via [src/legacy/assignment-generator/LegacyWorkspaceLayout.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/LegacyWorkspaceLayout.tsx).

### Old Public Routes Now Redirect
- The previous main-product routes now bounce users into legacy:
  - [src/app/assignments/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/assignments/page.tsx)
  - [src/app/assignments/create/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/assignments/create/page.tsx)
  - [src/app/assignments/[id]/output/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/assignments/[id]/output/page.tsx)
  - [src/app/library/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/library/page.tsx)

### Navigation Is Agent-First Now
- Primary CTA in the sidebar now opens `/agent`.
- Main navigation now prioritizes `Agent` and `Legacy` instead of `Assignments` and `My Library`.
- Login now lands authenticated users into `/agent`.

Files:
- [src/components/layout/Sidebar.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/layout/Sidebar.tsx)
- [src/components/layout/MobileNav.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/layout/MobileNav.tsx)
- [src/app/login/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/login/page.tsx)
- [src/app/coming-soon/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/coming-soon/page.tsx)

### Legacy UI Links Retargeted
- The preserved assignment UI now links into `/legacy/...` instead of the old top-level routes.

Files:
- [src/components/create/CreateAssignmentForm.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/create/CreateAssignmentForm.tsx)
- [src/components/dashboard/AssignmentCard.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/dashboard/AssignmentCard.tsx)
- [src/components/dashboard/EmptyState.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/dashboard/EmptyState.tsx)

### Product Identity Metadata Updated
- Root metadata now describes Libra as an agentic document workspace rather than an assignment creator.

File:
- [src/app/layout.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/layout.tsx)

### What Still Needs Doing
- The landing page at [src/app/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/page.tsx) still contains assignment-era marketing copy and mockups in several sections.
- `/agent` is still chat + PDF preview first; the new markdown/source editor mode has not been added yet.
- The old assignment stores/services still exist and are intentionally untouched because the legacy flow still runs on them.

## Update 2026-04-15

### Source Editor Added To `/agent`
- The left workspace is no longer chat-only.
- Added a new client-side workspace wrapper so the user can switch between:
  - chat
  - source editing
- The source side uses Monaco and supports:
  - markdown
  - LaTeX
  - plain text

Files:
- [src/components/agent/AgentWorkspacePanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/AgentWorkspacePanel.tsx)
- [src/components/agent/SourceEditorPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/SourceEditorPanel.tsx)
- [src/app/agent/page.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/agent/page.tsx)

### Editor State Wired Into The Agent Store
- Added persisted client-side source draft state for the agent session:
  - `editorMode`
  - `editorContent`
  - `editorDirty`
- The editor now hydrates from the latest available document source in this order:
  - latest artifact LaTeX
  - session `currentTex`
  - session `sourceContextText`
- Added a `sendEditorDraft(...)` action that packages the edited source into a prompt and sends it through the existing `/agent` backend flow.
- Added a reset action so the editor can snap back to the latest known backend state.

File:
- [src/store/agentStore.ts](c:/R/Veda/.claude/worktrees/keen-neumann/src/store/agentStore.ts)

### Theme Accent Shifted From Green To Blue
- Primary accent tokens now use blue in the shared theme.
- The main agent workspace, sidebar/mobile shell, shared header, and legacy preserved pages were updated to follow the blue accent so the product feels visually unified.

Files:
- [src/app/globals.css](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/globals.css)
- [src/components/layout/Sidebar.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/layout/Sidebar.tsx)
- [src/components/layout/MobileNav.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/layout/MobileNav.tsx)
- [src/components/layout/Header.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/layout/Header.tsx)
- [src/app/agent/layout.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/app/agent/layout.tsx)
- [src/components/agent/ChatPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/ChatPanel.tsx)
- [src/components/agent/TerminalPanel.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/components/agent/TerminalPanel.tsx)
- [src/legacy/assignment-generator/LegacyWorkspaceLayout.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/LegacyWorkspaceLayout.tsx)
- [src/legacy/assignment-generator/pages/AssignmentsPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/AssignmentsPage.tsx)
- [src/legacy/assignment-generator/pages/AssignmentOutputPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/AssignmentOutputPage.tsx)
- [src/legacy/assignment-generator/pages/LibraryPage.tsx](c:/R/Veda/.claude/worktrees/keen-neumann/src/legacy/assignment-generator/pages/LibraryPage.tsx)

### Verification
- Root app type-check passed:
  - `npm exec tsc --noEmit`
- Server type-check passed:
  - `npm exec tsc --noEmit` run from [server](c:/R/Veda/.claude/worktrees/keen-neumann/server)
