export type AgentToolCostHint = "small" | "medium" | "large";

export interface AgentToolContext {
  sessionId: string;
  userId?: string;
  turnId?: string;
  mode?: string;
  signal?: AbortSignal;
}

export interface AgentTool<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  isReadOnly: boolean;
  requiresPermission: boolean;
  tokenCostHint: AgentToolCostHint;
  run(input: Input, context: AgentToolContext): Promise<Output>;
}

export interface AgentToolDescriptor {
  name: string;
  description: string;
  isReadOnly: boolean;
  requiresPermission: boolean;
  tokenCostHint: AgentToolCostHint;
}

export class AgentToolRegistry {
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Agent tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
  }

  get(name: string) {
    return this.tools.get(name) || null;
  }

  list(): AgentToolDescriptor[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      isReadOnly: tool.isReadOnly,
      requiresPermission: tool.requiresPermission,
      tokenCostHint: tool.tokenCostHint,
    }));
  }

  async run<Input, Output>(
    name: string,
    input: Input,
    context: AgentToolContext
  ): Promise<Output> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Unknown agent tool: ${name}`);
    }

    return tool.run(input, context) as Promise<Output>;
  }
}

export const agentToolRegistry = new AgentToolRegistry();
