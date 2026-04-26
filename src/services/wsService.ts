import { io, Socket } from "socket.io-client";
import type {
  AgentArtifact,
  AgentMessage,
  AgentSession,
  AgentSessionStatus,
  GenerationStatus,
} from "@/types";

type StatusCallback = (status: GenerationStatus, progress: number) => void;

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Socket.io connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket.io disconnected");
    });
  }

  return socket;
}

/**
 * Listen for real-time generation status updates for a specific assignment.
 * Returns a cleanup function to stop listening.
 */
export function listenForGeneration(
  assignmentId: string,
  onStatus: StatusCallback
): () => void {
  const sock = getSocket();

  const handler = (data: {
    assignmentId: string;
    status: GenerationStatus;
    progress: number;
  }) => {
    if (data.assignmentId === assignmentId) {
      onStatus(data.status, data.progress);
    }
  };

  sock.on("generation:status", handler);

  return () => {
    sock.off("generation:status", handler);
  };
}

/**
 * Legacy simulation fallback — used when backend is not running.
 * Keeps the frontend functional for development.
 */
export function simulateGeneration(onStatus: StatusCallback): () => void {
  let cancelled = false;

  const run = async () => {
    if (cancelled) return;
    onStatus("queued", 0);

    await sleep(800);
    if (cancelled) return;
    onStatus("processing", 20);

    await sleep(1000);
    if (cancelled) return;
    onStatus("processing", 50);

    await sleep(1000);
    if (cancelled) return;
    onStatus("processing", 80);

    await sleep(700);
    if (cancelled) return;
    onStatus("done", 100);
  };

  run();

  return () => {
    cancelled = true;
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface AgentSessionHandlers {
  onStatus?: (status: AgentSessionStatus, error?: string | null) => void;
  onMessage?: (message: AgentMessage) => void;
  onArtifact?: (artifact: AgentArtifact) => void;
  onSession?: (session: AgentSession) => void;
}

export function listenForAgentSession(
  sessionId: string,
  handlers: AgentSessionHandlers
): () => void {
  const sock = getSocket();

  const statusHandler = (data: {
    sessionId: string;
    status: AgentSessionStatus;
    error?: string | null;
  }) => {
    if (data.sessionId === sessionId) {
      handlers.onStatus?.(data.status, data.error);
    }
  };

  const messageHandler = (data: {
    sessionId: string;
    message: AgentMessage;
  }) => {
    if (data.sessionId === sessionId) {
      handlers.onMessage?.(data.message);
    }
  };

  const artifactHandler = (data: {
    sessionId: string;
    artifact: AgentArtifact;
  }) => {
    if (data.sessionId === sessionId) {
      handlers.onArtifact?.(data.artifact);
    }
  };

  const sessionHandler = (data: {
    sessionId: string;
    session: AgentSession;
  }) => {
    if (data.sessionId === sessionId) {
      handlers.onSession?.(data.session);
    }
  };

  sock.on("agent:status", statusHandler);
  sock.on("agent:message", messageHandler);
  sock.on("agent:artifact", artifactHandler);
  sock.on("agent:session", sessionHandler);

  return () => {
    sock.off("agent:status", statusHandler);
    sock.off("agent:message", messageHandler);
    sock.off("agent:artifact", artifactHandler);
    sock.off("agent:session", sessionHandler);
  };
}
