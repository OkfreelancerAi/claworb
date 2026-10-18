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

  const input = body as { claim?: unknown; evidenceUrls?: unknown; context?: unknown };
  if (typeof input.claim !== "string" || input.claim.trim().length < 8 || input.claim.length > 4000) {
    return NextResponse.json({ error: "claim must be 8–4000 characters" }, { status: 400 });
  }
  if (!Array.isArray(input.evidenceUrls) || input.evidenceUrls.length > 30 ||
      !input.evidenceUrls.every((value) => typeof value === "string")) {
    return NextResponse.json({ error: "evidenceUrls must be an array of up to 30 URLs" }, { status: 400 });
  }

  const validUrls: string[] = [];
  const rejectedUrls: string[] = [];
  for (const raw of input.evidenceUrls as string[]) {
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:" || url.username || url.password) {
        rejectedUrls.push(raw);
        continue;
      }
      validUrls.push(url.toString());
    } catch {
      rejectedUrls.push(raw);
    }
  }

  const domains = [...new Set(validUrls.map((value) => new URL(value).hostname.toLowerCase()))];
  const missing = [
    ...(validUrls.length === 0 ? ["At least one HTTPS evidence URL"] : []),
    ...(domains.length < 2 && validUrls.length > 1 ? ["Independent source diversity (only one distinct domain supplied)"] : []),
    ...(typeof input.context !== "string" || input.context.trim().length === 0 ? ["Claim context and date"] : []),
  ];

  return NextResponse.json({
    service: "evidence-pack-quality-check",
    claim: input.claim.trim(),
    context: typeof input.context === "string" ? input.context.trim().slice(0, 2000) : null,
    suppliedEvidence: validUrls,
    distinctDomains: domains,
    rejectedUrls,
    checklist: { complete: missing.length === 0, missing },
    factualTruthVerified: false,
    note: "This endpoint validates evidence-pack completeness and URL shape only. It does not fetch sources or establish that the claim is true.",
  });
};

const paidHandler = withPaidAgentService(
  PRICES_USDC.evidenceCheck,
  "evidence-check",
  "Agent evidence-pack quality check",
  handler
);

export async function POST(request: NextRequest) {
  return paidHandler(request);
}
