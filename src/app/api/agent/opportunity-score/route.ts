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
  const fields = ["problem", "targetUser", "evidence", "distribution", "riskNotes"];
  const textFields = fields.filter((field) =>
    typeof input[field] === "string" && (input[field] as string).trim().length >= 8
  );
  const missing = fields.filter((field) => !textFields.includes(field));
  const cost = input.buildCostUsd;
  const revenue = input.expectedRevenueUsd;
  const validMoney = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
  const moneyProvided = validMoney(cost) && validMoney(revenue);

  const evidenceScore = textFields.includes("evidence") ? 25 : 0;
  const userScore = textFields.includes("targetUser") ? 20 : 0;
  const distributionScore = textFields.includes("distribution") ? 20 : 0;
  const problemScore = textFields.includes("problem") ? 20 : 0;
  const riskScore = textFields.includes("riskNotes") ? 15 : 0;
  const completenessScore = evidenceScore + userScore + distributionScore + problemScore + riskScore;
  const estimatedGrossMarginUsd = moneyProvided ? revenue - cost : null;
  const marginRatio = moneyProvided && revenue > 0 ? (revenue - cost) / revenue : null;

  return NextResponse.json({
    service: "agent-opportunity-triage",
    score: completenessScore,
    scoreScale: "0–100; input completeness and specificity, not probability of success",
    factors: {
      problem: problemScore,
      targetUser: userScore,
      evidence: evidenceScore,
      distribution: distributionScore,
      riskNotes: riskScore,
    },
    missingOrWeakInputs: missing,
    callerSuppliedEconomics: moneyProvided ? {
      buildCostUsd: cost,
      expectedRevenueUsd: revenue,
      arithmeticGrossMarginUsd: estimatedGrossMarginUsd,
      arithmeticGrossMarginRatio: marginRatio,
      verifiedAgainstMarketData: false,
    } : null,
    recommendation: completenessScore >= 80 && moneyProvided
      ? "Proceed to a small validation test; independently verify assumptions first."
      : "Gather missing evidence and validate demand before spending.",
    note: "Scores and financial arithmetic use only caller-supplied inputs. This is not investment advice and does not predict or guarantee earnings.",
  });
};

const paidHandler = withPaidAgentService(
  PRICES_USDC.opportunityScore,
  "opportunity-score",
  "Agent opportunity triage score",
  handler
);

export async function POST(request: NextRequest) {
  return paidHandler(request);
}
