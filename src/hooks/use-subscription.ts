import { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "premium" | "diamond";

const FREE_POSTER_LIMIT_PER_MONTH = 5;
const FREE_POSTER_USAGE_KEY = "salam-takziah-free-usage";

type UsageStore = Record<string, number>;

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getUsageKey = (identity: string) => `${identity}:${getCurrentMonthKey()}`;

const readUsageStore = (): UsageStore => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(FREE_POSTER_USAGE_KEY);
    return raw ? (JSON.parse(raw) as UsageStore) : {};
  } catch {
    return {};
  }
};

const writeUsageStore = (store: UsageStore) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FREE_POSTER_USAGE_KEY, JSON.stringify(store));
};

const normalizePlan = (value: unknown): SubscriptionPlan => {
  const plan = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (plan === "premium" || plan === "pro") {
    return "premium";
  }

  if (plan === "diamond" || plan === "enterprise") {
    return "diamond";
  }

  return "free";
};

const resolvePlanFromSession = (session: Session | null): SubscriptionPlan => {
  if (!session?.user) {
    return "free";
  }

  return normalizePlan(
    session.user.user_metadata?.plan ??
      session.user.user_metadata?.tier ??
      session.user.app_metadata?.plan ??
      session.user.app_metadata?.tier,
  );
};

const getIdentityFromSession = (session: Session | null) => {
  if (session?.user?.id) {
    return session.user.id;
  }

  return "guest";
};

export const useSubscription = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const plan = useMemo(() => resolvePlanFromSession(session), [session]);
  const identity = useMemo(() => getIdentityFromSession(session), [session]);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const store = readUsageStore();
    setUsageCount(store[getUsageKey(identity)] ?? 0);
  }, [identity]);

  const recordPosterGeneration = () => {
    const store = readUsageStore();
    const key = getUsageKey(identity);
    const nextCount = (store[key] ?? 0) + 1;

    store[key] = nextCount;
    writeUsageStore(store);
    setUsageCount(nextCount);
  };

  const remainingFreePosters = Math.max(0, FREE_POSTER_LIMIT_PER_MONTH - usageCount);
  const canGeneratePoster = plan !== "free" || remainingFreePosters > 0;
  const isPremiumTier = plan === "premium";
  const isDiamondTier = plan === "diamond";
  const isPaidTier = isPremiumTier || isDiamondTier;

  return {
    plan,
    isFreeTier: plan === "free",
    isPremiumTier,
    isDiamondTier,
    isPaidTier,
    monthlyPosterCount: usageCount,
    remainingFreePosters,
    canGeneratePoster,
    recordPosterGeneration,
  };
};
