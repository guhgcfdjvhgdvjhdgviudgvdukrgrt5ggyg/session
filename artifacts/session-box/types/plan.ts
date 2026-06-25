export type PlanTier = "free" | "basic" | "pro" | "plus" | "unlimited";

export interface Plan {
  tier: PlanTier;
  name: string;
  maxSessions: number;
  maxExtensionsPerSession: number;
  desktopMode: boolean;
  customExtensions: boolean;
  adFree: boolean;
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: "free",
    name: "Free",
    maxSessions: 10,
    maxExtensionsPerSession: 2,
    desktopMode: true,
    customExtensions: false,
    adFree: false,
  },
  basic: {
    tier: "basic",
    name: "Basic",
    maxSessions: 50,
    maxExtensionsPerSession: 5,
    desktopMode: true,
    customExtensions: true,
    adFree: false,
  },
  pro: {
    tier: "pro",
    name: "Pro",
    maxSessions: 150,
    maxExtensionsPerSession: 15,
    desktopMode: true,
    customExtensions: true,
    adFree: true,
  },
  plus: {
    tier: "plus",
    name: "Plus",
    maxSessions: 500,
    maxExtensionsPerSession: 30,
    desktopMode: true,
    customExtensions: true,
    adFree: true,
  },
  unlimited: {
    tier: "unlimited",
    name: "Unlimited",
    maxSessions: 9999,
    maxExtensionsPerSession: 100,
    desktopMode: true,
    customExtensions: true,
    adFree: true,
  },
};

export function isAdminActivationKey(key: string): PlanTier | null {
  const parts = key.trim().toLowerCase().split("-");
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts[0] !== "sbx") return null;
  const tier = parts.length === 3 ? parts[2] : parts[1];
  if (tier === "basic" || tier === "pro" || tier === "plus" || tier === "unlimited") return tier;
  return null;
}
