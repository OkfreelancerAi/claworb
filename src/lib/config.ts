// ClawOrb configuration
// Recipient addresses must be independently verified before production launch.

export const OWNER_LOCK = {
  base: "0x34AcF08d68D85644bf322B7167151F8422f1BafC",
  solanaPrimary: "CG9DVW1yaBd6BeMjcJAzyTgCaY2nvp7oywN711BQUZoz",
  solanaTreasury: "2jAMeJZH1UeNSgdzdhHgYwAm6286aRqxMCdx52DBw7xo",
} as const;

export const SPLITS = {
  ownerBase: 0.2,
  ownerSolana: 0.3,
  treasury: 0.5,
} as const;

export const PRICES_USDC = {
  health: 0,
  price: 0.01,
  earn: 0.05,
  skill: 0.10,
  evidenceCheck: 0.01,
  opportunityScore: 0.02,
  taskSpec: 0.01,
} as const;

export const CHAINS = ["base", "solana"] as const;

export const APP_NAME = "ClawOrb";
export const OWNER_HANDLE = "@okfreelancer";
