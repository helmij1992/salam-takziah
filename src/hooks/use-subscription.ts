import { useCallback, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "premium" | "diamond";
export type AppRole = "user" | "superadmin";

const FREE_POSTER_LIMIT_PER_MONTH = 5;
const FREE_POSTER_USAGE_KEY = "salam-takziah-free-usage";
const SUPERADMIN_EMAILS = ["ai.helmij@gmail.com"];

type UsageStore = Record<string, number>;
type QuotaStatus = {
  generationCount: number;
  remainingCount: number;
  monthlyLimit: number;
  periodKey: string | null;
};

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

const normalizeRole = (value: unknown): AppRole => {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (role === "superadmin") {
    return "superadmin";
  }

  return "user";
};

const normalizeBooleanFlag = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return false;
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

const resolveRoleFromSession = (session: Session | null): AppRole => {
  if (!session?.user) {
    return "user";
  }

  const metadataRole = normalizeRole(
    session.user.user_metadata?.role ??
      session.user.app_metadata?.role,
  );

  if (metadataRole === "superadmin") {
    return "superadmin";
  }

  const isSuperadminFlag = normalizeBooleanFlag(
    session.user.user_metadata?.is_superadmin ??
      session.user.app_metadata?.is_superadmin,
  );

  if (isSuperadminFlag) {
    return "superadmin";
  }

  const email = session.user.email?.trim().toLowerCase();
  if (email && SUPERADMIN_EMAILS.includes(email)) {
    return "superadmin";
  }

  return "user";
};

const getIdentityFromSession = (session: Session | null) => {
  if (session?.user?.id) {
    return session.user.id;
  }

  return "guest";
};

const getLocalQuotaStatus = (identity: string): QuotaStatus => {
  const store = readUsageStore();
  const generationCount = store[getUsageKey(identity)] ?? 0;

  return {
    generationCount,
    remainingCount: Math.max(0, FREE_POSTER_LIMIT_PER_MONTH - generationCount),
    monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
    periodKey: getCurrentMonthKey(),
  };
};

export const useSubscription = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({
    generationCount: 0,
    remainingCount: FREE_POSTER_LIMIT_PER_MONTH,
    monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
    periodKey: null,
  });
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [quotaSource, setQuotaSource] = useState<"local" | "remote">("local");

  const subscriptionPlan = useMemo(() => resolvePlanFromSession(session), [session]);
  const appRole = useMemo(() => resolveRoleFromSession(session), [session]);
  const plan = useMemo<SubscriptionPlan>(
    () => (appRole === "superadmin" ? "diamond" : subscriptionPlan),
    [appRole, subscriptionPlan],
  );
  const identity = useMemo(() => getIdentityFromSession(session), [session]);

  const refreshQuota = useCallback(async () => {
    if (!session?.user) {
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      setIsQuotaLoading(false);
      return;
    }

    if (plan !== "free") {
      setQuotaStatus({
        generationCount: 0,
        remainingCount: FREE_POSTER_LIMIT_PER_MONTH,
        monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
        periodKey: getCurrentMonthKey(),
      });
      setQuotaSource("remote");
      setIsQuotaLoading(false);
      return;
    }

    setIsQuotaLoading(true);
    const { data, error } = await supabase.rpc("get_free_poster_quota_status");

    if (error || !data || data.length === 0) {
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      setIsQuotaLoading(false);
      return;
    }

    const nextStatus = data[0];
    setQuotaStatus({
      generationCount: nextStatus.generation_count,
      remainingCount: nextStatus.remaining_count,
      monthlyLimit: nextStatus.monthly_limit,
      periodKey: nextStatus.period_key,
    });
    setQuotaSource("remote");
    setIsQuotaLoading(false);
  }, [identity, plan, session?.user]);

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
    void refreshQuota();
  }, [identity, plan, refreshQuota]);

  const recordPosterGeneration = useCallback(async () => {
    if (plan !== "free" || !session?.user) {
      return true;
    }

    const { data, error } = await supabase.rpc("consume_free_poster_quota");

    if (error || !data || data.length === 0) {
      const store = readUsageStore();
      const key = getUsageKey(identity);
      const nextCount = (store[key] ?? 0) + 1;

      if (nextCount > FREE_POSTER_LIMIT_PER_MONTH) {
        setQuotaStatus(getLocalQuotaStatus(identity));
        setQuotaSource("local");
        return false;
      }

      store[key] = nextCount;
      writeUsageStore(store);
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      return true;
    }

    const nextStatus = data[0];
    setQuotaStatus({
      generationCount: nextStatus.generation_count,
      remainingCount: nextStatus.remaining_count,
      monthlyLimit: nextStatus.monthly_limit,
      periodKey: nextStatus.period_key,
    });
    setQuotaSource("remote");
    return nextStatus.allowed;
  }, [identity, plan, session?.user]);

  const remainingFreePosters = Math.max(0, quotaStatus.remainingCount);
  const canGeneratePoster = plan !== "free" || remainingFreePosters > 0;
  const isPremiumTier = plan === "premium";
  const isDiamondTier = plan === "diamond";
  const isPaidTier = isPremiumTier || isDiamondTier;
  const isSuperadmin = appRole === "superadmin";

  return {
    plan,
    subscriptionPlan,
    appRole,
    identity,
    userEmail: session?.user?.email ?? null,
    isSuperadmin,
    isFreeTier: plan === "free",
    isPremiumTier,
    isDiamondTier,
    isPaidTier,
    monthlyPosterCount: quotaStatus.generationCount,
    remainingFreePosters,
    canGeneratePoster,
    isQuotaLoading,
    quotaSource,
    refreshQuota,
    recordPosterGeneration,
  };
};
