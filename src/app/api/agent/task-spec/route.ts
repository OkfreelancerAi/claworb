import { NextRequest, NextResponse } from "next/server";
import { PRICES_USDC } from "@/lib/config";
import { withPaidAgentService } from "@/lib/x402";

const handler = async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (typeof input.goal !== "string" || input.goal.trim().length < 8 || input.goal.length > 3000) {
    return NextResponse.json({ error: "goal must be 8–3000 characters" }, { status: 400 });
  }

  const criteria = Array.isArray(input.acceptanceCriteria)
    ? input.acceptanceCriteria.filter((item): item is string =>
        typeof item === "string" && item.trim().length > 0
      ).slice(0, 20).map((item) => item.trim())
    : [];
  const outputFormat = typeof input.outputFormat === "string"
    ? input.outputFormat.trim().slice(0, 80)
    : "Markdown report";
  const deadline = typeof input.deadline === "string" ? input.deadline.trim().slice(0, 80) : null;

  return NextResponse.json({
    service: "structured-agent-task-specification",
    task: {
      goal: input.goal.trim(),
      outputFormat,
      deadline,
      acceptanceCriteria: criteria,
      verification: [
        "Provide artifact or output URL",
        "List evidence and sources used",
        "Mark assumptions and unknowns explicitly",
        "Do not claim external actions or results without receipts",
      ],
      failureConditions: [
        "Required input or evidence is missing",
        "Acceptance criteria are not met",
        "A claimed external action cannot be independently verified",
      ],
    },
    missingInputs: [
      ...(criteria.length === 0 ? ["Add at least one measurable acceptance criterion"] : []),
      ...(!deadline ? ["Set a deadline or explicitly mark the task as unscheduled"] : []),
    ],
    note: "This endpoint structures a task from the caller's input; it does not execute the task.",
  });
};

const paidHandler = withPaidAgentService(
  PRICES_USDC.taskSpec,
  "task-spec",
  "Structured agent task specification",
  handler
);

export async function POST(request: NextRequest) {
  return paidHandler(request);
}
