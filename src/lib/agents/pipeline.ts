import type { Agent, AgentContext, AgentResult } from "./types";

/**
 * Minimal sequential pipeline skeleton (QUANTORB-inspired).
 * Replace each agent with real logic.
 */
export async function runPipeline(
  agents: Agent[],
  initial: AgentContext
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  let ctx: AgentContext = { ...initial, previous: {} };

  for (const agent of agents) {
    const result = await agent.run(ctx);
    results.push(result);
    ctx = {
      ...ctx,
      previous: {
        ...ctx.previous,
        [agent.name]: result.output,
      },
    };
  }

  return results;
}
