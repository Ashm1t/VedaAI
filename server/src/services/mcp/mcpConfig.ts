import fs from "fs";
import path from "path";
import type { McpServerConfig } from "./mcpContracts.js";

interface McpConfigFile {
  servers?: McpServerConfig[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeServer(value: unknown): McpServerConfig | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : id;
  const transport =
    value.transport === "http" || value.transport === "stdio"
      ? value.transport
      : "stdio";

  if (!id || !name) return null;

  return {
    id,
    name,
    transport,
    command: typeof value.command === "string" ? value.command : undefined,
    args: Array.isArray(value.args)
      ? value.args.filter((item): item is string => typeof item === "string")
      : undefined,
    url: typeof value.url === "string" ? value.url : undefined,
    env: isRecord(value.env)
      ? Object.fromEntries(
          Object.entries(value.env).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
      : undefined,
    enabled: value.enabled !== false,
    trusted: value.trusted === true,
  };
}

export function loadMcpConfig(projectRoot: string): McpServerConfig[] {
  const configPath = path.join(projectRoot, ".libra", "mcp.json");
  if (!fs.existsSync(configPath)) return [];

  const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8")) as McpConfigFile;
  const servers = Array.isArray(parsed.servers) ? parsed.servers : [];

  return servers.map(normalizeServer).filter(Boolean) as McpServerConfig[];
}
