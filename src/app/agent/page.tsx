"use client";

import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import AgentWorkspacePanel from "@/components/agent/AgentWorkspacePanel";
import PdfPreview from "@/components/agent/PdfPreview";
import { useAgentStore } from "@/store/agentStore";
import { listenForAgentSession } from "@/services/wsService";

export default function AgentPage() {
  const sessionId = useAgentStore((state) => state.session?.id);
  const initializeSession = useAgentStore((state) => state.initializeSession);
  const applyRemoteStatus = useAgentStore((state) => state.applyRemoteStatus);
  const applyRemoteMessage = useAgentStore((state) => state.applyRemoteMessage);
  const applyRemoteArtifact = useAgentStore((state) => state.applyRemoteArtifact);
  const applyRemoteSession = useAgentStore((state) => state.applyRemoteSession);

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (!sessionId) return;

    return listenForAgentSession(sessionId, {
      onStatus: (status, error) => applyRemoteStatus(status, error),
      onMessage: (message) => applyRemoteMessage(message),
      onArtifact: (artifact) => applyRemoteArtifact(artifact),
      onSession: (session) => applyRemoteSession(session),
    });
  }, [
    applyRemoteArtifact,
    applyRemoteMessage,
    applyRemoteSession,
    applyRemoteStatus,
    sessionId,
  ]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-[#333] bg-[#121212]">
      <div className="h-full overflow-hidden rounded-2xl">
        <div className="hidden h-full md:block">
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={38} minSize={28}>
              <AgentWorkspacePanel />
            </Panel>

            <Separator
              style={{ width: 6, cursor: "col-resize", background: "#1a1a1a" }}
            />

            <Panel defaultSize={62} minSize={35}>
              <PdfPreview />
            </Panel>
          </Group>
        </div>

        <div className="flex h-full flex-col md:hidden">
          <div className="min-h-0 flex-1 border-b border-[#333]">
            <AgentWorkspacePanel />
          </div>
          <div className="min-h-0 flex-1">
            <PdfPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
