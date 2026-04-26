export type McpTransportKind = "stdio" | "http";

export interface McpServerConfig {
  id: string;
  name: string;
  transport: McpTransportKind;
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  enabled: boolean;
  trusted: boolean;
}

export interface McpToolDescriptor {
  serverId: string;
  name: string;
  description: string;
  inputSchema?: unknown;
  isReadOnly?: boolean;
}

export interface McpResourceDescriptor {
  serverId: string;
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface McpCallInput {
  serverId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface McpCallResult {
  serverId: string;
  toolName: string;
  status: "success" | "error";
  durationMs: number;
  artifactId?: string;
  summary: string;
  raw?: unknown;
}

export interface McpPermissionDecision {
  allowed: boolean;
  reason: string;
  requiresUserApproval: boolean;
}
