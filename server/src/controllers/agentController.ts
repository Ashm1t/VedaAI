import type { Request, Response } from "express";
import fs from "fs";
import {
  appendUserMessage,
  artifactPdfExists,
  createAgentSession,
  getAgentSessionForUser,
  getArtifactForUser,
  getLatestArtifactForSession,
  ingestFilesIntoAgentSession,
  processAgentMessage,
  resolveArtifactPdfPath,
} from "../services/agentService.js";

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export async function createSession(req: Request, res: Response) {
  const session = await createAgentSession(req.user?.userId);
  res.status(201).json(session);
}

export async function getSession(req: Request, res: Response) {
  const session = await getAgentSessionForUser(
    firstParam(req.params.id),
    req.user?.userId
  );
  if (!session) {
    res.status(404).json({ error: "Agent session not found" });
    return;
  }

  res.json(session.toJSON());
}

export async function postMessage(req: Request, res: Response) {
  const content =
    typeof req.body?.content === "string" ? req.body.content.trim() : "";
  const selectedTemplateId =
    typeof req.body?.selectedTemplateId === "string"
      ? req.body.selectedTemplateId.trim()
      : "";
  const answers =
    req.body?.answers && typeof req.body.answers === "object"
      ? Object.fromEntries(
          Object.entries(req.body.answers).map(([key, value]) => [
            key,
            typeof value === "string" ? value : "",
          ])
        )
      : undefined;
  const hasAnswers =
    answers && Object.values(answers).some((value) => value.trim().length > 0);

  if (!content && !selectedTemplateId && !hasAnswers) {
    res.status(400).json({
      error: "Message content, template selection, or answers are required",
    });
    return;
  }

  const result = await appendUserMessage(
    firstParam(req.params.id),
    {
      content,
      selectedTemplateId,
      answers,
    },
    req.user?.userId
  );

  if (!result) {
    res.status(404).json({ error: "Agent session not found" });
    return;
  }

  void processAgentMessage(
    result.session.id,
    {
      content,
      selectedTemplateId,
      answers,
    },
    result.message.id
  );

  res.status(202).json({
    accepted: true,
    sessionId: result.session.id,
    message: result.message,
  });
}

export async function uploadSessionFiles(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];

  if (files.length === 0) {
    res.status(400).json({ error: "At least one file is required" });
    return;
  }

  const result = await ingestFilesIntoAgentSession(
    firstParam(req.params.id),
    files,
    req.user?.userId
  );

  if (!result) {
    res.status(404).json({ error: "Agent session not found" });
    return;
  }

  res.status(201).json({
    sessionId: result.session.id,
    message: result.message,
    files: result.files,
  });
}

export async function getLatestArtifact(req: Request, res: Response) {
  const artifact = await getLatestArtifactForSession(
    firstParam(req.params.id),
    req.user?.userId
  );

  if (!artifact) {
    res.status(404).json({ error: "No agent artifact found" });
    return;
  }

  res.json(artifact.toJSON());
}

export async function getArtifactPdf(req: Request, res: Response) {
  const artifact = await getArtifactForUser(
    firstParam(req.params.id),
    req.user?.userId
  );
  if (!artifact) {
    res.status(404).json({ error: "Agent artifact not found" });
    return;
  }

  const pdfPath = await resolveArtifactPdfPath(
    firstParam(req.params.id),
    req.user?.userId
  );
  if (!pdfPath || !artifactPdfExists(pdfPath)) {
    res.status(404).json({ error: "Artifact PDF not found" });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${artifact.title || "agent-artifact"}.pdf"`
  );
  fs.createReadStream(pdfPath).pipe(res);
}
