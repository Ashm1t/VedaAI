import type {
  AgentArtifact,
  AgentMessage,
  AgentSession,
  AgentSourceFile,
} from "@/types";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/api/agent";

export interface AgentMessageInput {
  content?: string;
  selectedTemplateId?: string;
  answers?: Record<string, string>;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function readErrorMessage(res: Response): Promise<string> {
  const fallback = `Request failed with ${res.status} ${res.statusText}`;
  const raw = await res.text();

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return `${fallback}: ${parsed.error}`;
    }

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return `${fallback}: ${parsed.message}`;
    }
  } catch {
    // Fall through to plain-text body handling.
  }

  const compact = raw.replace(/\s+/g, " ").trim();
  if (!compact) return fallback;

  return compact.length > 240
    ? `${fallback}: ${compact.slice(0, 237)}...`
    : `${fallback}: ${compact}`;
}

function describeRequestFailure(error: unknown, endpoint: string): string {
  if (error instanceof Error) {
    if (error.name === "TypeError") {
      return `Unable to reach the backend at ${endpoint}. Check that the server is running on http://localhost:4000.`;
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return `Unexpected network error while requesting ${endpoint}.`;
}

async function readJson<T>(res: Response, endpoint: string): Promise<T> {
  const raw = await res.text();

  if (!raw) {
    throw new Error(`Empty response body from ${endpoint}`);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`);
  }
}

export async function createAgentSession(): Promise<AgentSession> {
  const endpoint = `${API_BASE}/sessions`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return readJson<AgentSession>(res, endpoint);
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}

export async function fetchAgentSession(
  sessionId: string
): Promise<AgentSession | undefined> {
  const endpoint = `${API_BASE}/sessions/${sessionId}`;

  try {
    const res = await fetch(endpoint, {
      headers: authHeaders(),
    });

    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return readJson<AgentSession>(res, endpoint);
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}

export async function sendAgentMessage(
  sessionId: string,
  input: AgentMessageInput
): Promise<{ accepted: boolean; sessionId: string; message: AgentMessage }> {
  const endpoint = `${API_BASE}/sessions/${sessionId}/messages`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return readJson<{ accepted: boolean; sessionId: string; message: AgentMessage }>(
      res,
      endpoint
    );
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}

export async function fetchLatestAgentArtifact(
  sessionId: string
): Promise<AgentArtifact | undefined> {
  const endpoint = `${API_BASE}/sessions/${sessionId}/artifacts/latest`;

  try {
    const res = await fetch(endpoint, {
      headers: authHeaders(),
    });

    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return readJson<AgentArtifact>(res, endpoint);
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}

export async function fetchAgentArtifactPdfBlob(
  artifactId: string
): Promise<Blob> {
  const endpoint = `${API_BASE}/artifacts/${artifactId}/pdf`;

  try {
    const res = await fetch(endpoint, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return res.blob();
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}

export async function uploadAgentFiles(
  sessionId: string,
  files: File[]
): Promise<{
  sessionId: string;
  message: AgentMessage;
  files: AgentSourceFile[];
}> {
  const endpoint = `${API_BASE}/sessions/${sessionId}/files`;

  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file);
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    return readJson<{
      sessionId: string;
      message: AgentMessage;
      files: AgentSourceFile[];
    }>(res, endpoint);
  } catch (error) {
    throw new Error(describeRequestFailure(error, endpoint));
  }
}
