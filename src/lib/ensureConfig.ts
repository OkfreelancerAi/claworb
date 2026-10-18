// Lightweight runtime config validator for launch readiness
export const REQUIRED_ENVS = [
  "X402_PAY_TO",
  "X402_FACILITATOR_URL",
  "BASE_RPC_URL",
  "DATABASE_URL",
];

export function missingEnvs() {
  return REQUIRED_ENVS.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");
}

export function isLaunchReady() {
  return missingEnvs().length === 0;
}

export function ensureEnvsOrThrow() {
  const missing = missingEnvs();
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
