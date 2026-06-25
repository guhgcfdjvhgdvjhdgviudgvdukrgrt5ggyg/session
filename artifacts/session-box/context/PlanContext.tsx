import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Plan, PlanTier, PLANS, isAdminActivationKey } from "@/types/plan";
import { getDeviceId } from "@/services/device";

const STORAGE_KEY = "@session_box_plan_tier";

const TIER_ORDER: PlanTier[] = ["free", "basic", "pro", "plus", "unlimited"];

function randomStr(len: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

interface PlanContextValue {
  plan: Plan;
  deviceId: string;
  upgrade: (activationKey: string) => boolean;
  deviceKey: string;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  requestUpgrade: (tier: PlanTier) => string | null;
  parseRequestToken: (token: string) => { tier: PlanTier; deviceHint: string } | null;
  fulfillRequest: (token: string) => string | null;
  generateAdminKey: (tier: PlanTier) => string;
  adminKeys: string[];
  clearAdminKeys: () => void;
  tierList: PlanTier[];
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>(PLANS.free);
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceKey, setDeviceKey] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKeys, setAdminKeys] = useState<string[]>([]);

  useEffect(() => {
    getDeviceId().then((id) => {
      setDeviceId(id);
      setDeviceKey(`sbx-${id.slice(4, 12)}-${id.slice(12, 20)}`);
    });
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && raw in PLANS) {
        setPlan(PLANS[raw as PlanTier]);
      }
    });
  }, []);

  const upgrade = useCallback((activationKey: string): boolean => {
    const tier = isAdminActivationKey(activationKey);
    if (!tier) return false;
    const newPlan = PLANS[tier];
    setPlan(newPlan);
    AsyncStorage.setItem(STORAGE_KEY, tier);
    return true;
  }, []);

  const requestUpgrade = useCallback((tier: PlanTier): string | null => {
    if (!deviceId || !deviceKey) return null;
    const hash = deviceKey.slice(-8);
    const token = `req-${hash}-${tier}-${randomStr(4)}`;
    return token;
  }, [deviceId, deviceKey]);

  const parseRequestToken = useCallback((token: string): { tier: PlanTier; deviceHint: string } | null => {
    const parts = token.trim().toLowerCase().split("-");
    if (parts.length !== 4) return null;
    if (parts[0] !== "req") return null;
    const tier = parts[2] as PlanTier;
    if (!(tier in PLANS)) return null;
    return { tier, deviceHint: parts[1] };
  }, []);

  const fulfillRequest = useCallback((token: string): string | null => {
    const parsed = parseRequestToken(token);
    if (!parsed) return null;
    const key = `sbx-${randomStr(6)}-${parsed.tier}`;
    setAdminKeys((prev) => [...prev, key]);
    return key;
  }, [parseRequestToken]);

  const generateAdminKey = useCallback((tier: PlanTier): string => {
    const key = `sbx-${randomStr(6)}-${tier}`;
    setAdminKeys((prev) => [...prev, key]);
    return key;
  }, []);

  const clearAdminKeys = useCallback(() => setAdminKeys([]), []);

  return (
    <PlanContext.Provider
      value={{
        plan,
        deviceId,
        upgrade,
        deviceKey,
        isAdmin,
        setAdmin: setIsAdmin,
        requestUpgrade,
        parseRequestToken,
        fulfillRequest,
        generateAdminKey,
        adminKeys,
        clearAdminKeys,
        tierList: TIER_ORDER,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
