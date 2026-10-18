// ClawOrb configuration
// Replace placeholder addresses with final production wallets before mainnet use.

export const OWNER_LOCK = {
  base: "0x34AcF08d68D85644bf322B7167151F8422f1BafC",
  solanaPrimary: "CG9DVW1yaBd6BeMjcJAzyTgCaY2nvp7oynW711BQUZoz",
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
} as const;

export const CHAINS = ["base", "solana"] as const;

export const APP_NAME = "ClawOrb";
export const OWNER_HANDLE = "@okfreelancer";
