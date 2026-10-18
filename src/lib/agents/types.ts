export type AgentName =
  | "SCOUT"
  | "CARTOGRAPHER"
  | "JUDGE"
  | "QUANT"
  | "GUARD"
  | "EXECUTOR";

export interface AgentContext {
  input: unknown;
  previous: Record<string, unknown>;
  invite?: string;
  skillId?: string;
}

export interface AgentResult {
  agent: AgentName;
  output: unknown;
  confidence?: number;
  notes?: string;
}

export interface Agent {
  name: AgentName;
  run(ctx: AgentContext): Promise<AgentResult>;
}
