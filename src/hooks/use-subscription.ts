import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/contexts/AuthSessionContext";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "premium" | "diamond";
export type AppRole = "user" | "superadmin";

type AuthUserState = {
  id: string;
  email: string | null;
  createdAt: string | null;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
} | null;

const FREE_POSTER_LIMIT_PER_MONTH = 5;
const PREMIUM_TRIAL_DAYS = 14;
const PREMIUM_TRIAL_DOWNLOAD_LIMIT = 10;
const FREE_POSTER_USAGE_KEY = "salam-takziah-free-usage";
const SUPERADMIN_EMAILS = ["ai.helmij@gmail.com", "superadmin.test@salamtakziah.com"];

type UsageStore = Record<string, number>;
type QuotaStatus = {
  downloadCount: number;
  remainingCount: number;
  monthlyLimit: number;
  periodKey: string | null;
};

type PremiumTrialQuotaStatus = {
  downloadCount: number;
  remainingCount: number;
  downloadLimit: number;
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
    return "premium";
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

const resolvePlanFromAuthUser = (authUser: AuthUserState): SubscriptionPlan => {
  if (!authUser) {
    return "free";
  }

  return normalizePlan(
    authUser.userMetadata.plan ??
      authUser.userMetadata.tier ??
      authUser.appMetadata.plan ??
      authUser.appMetadata.tier,
  );
};

const resolveRoleFromAuthUser = (authUser: AuthUserState): AppRole => {
  if (!authUser) {
    return "user";
  }

  const metadataRole = normalizeRole(
    authUser.userMetadata.role ??
      authUser.appMetadata.role,
  );

  if (metadataRole === "superadmin") {
    return "superadmin";
  }

  const isSuperadminFlag = normalizeBooleanFlag(
    authUser.userMetadata.is_superadmin ??
      authUser.appMetadata.is_superadmin,
  );

  if (isSuperadminFlag) {
    return "superadmin";
  }

  const email = authUser.email?.trim().toLowerCase();
  if (email && SUPERADMIN_EMAILS.includes(email)) {
    return "superadmin";
  }

  return "user";
};

const getLocalQuotaStatus = (identity: string): QuotaStatus => {
  const store = readUsageStore();
  const downloadCount = store[getUsageKey(identity)] ?? 0;

  return {
    downloadCount,
    remainingCount: Math.max(0, FREE_POSTER_LIMIT_PER_MONTH - downloadCount),
    monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
    periodKey: getCurrentMonthKey(),
  };
};

const getPremiumTrialStatus = (authUser: AuthUserState, subscriptionPlan: SubscriptionPlan) => {
  if (!authUser || subscriptionPlan !== "premium" || !authUser.createdAt) {
    return {
      isActive: false,
      isExpired: false,
      endsAt: null as string | null,
      daysRemaining: null as number | null,
    };
  }

  const createdAtMs = new Date(authUser.createdAt).getTime();
  if (Number.isNaN(createdAtMs)) {
    return {
      isActive: true,
      isExpired: false,
      endsAt: null as string | null,
      daysRemaining: PREMIUM_TRIAL_DAYS,
    };
  }

  const endsAtMs = createdAtMs + PREMIUM_TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const isExpired = nowMs > endsAtMs;
  const msRemaining = Math.max(0, endsAtMs - nowMs);

  return {
    isActive: !isExpired,
    isExpired,
    endsAt: new Date(endsAtMs).toISOString(),
    daysRemaining: Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000))),
  };
};

const getDefaultPremiumTrialQuota = (): PremiumTrialQuotaStatus => ({
  downloadCount: 0,
  remainingCount: PREMIUM_TRIAL_DOWNLOAD_LIMIT,
  downloadLimit: PREMIUM_TRIAL_DOWNLOAD_LIMIT,
});

export const useSubscription = () => {
  const { authUser, identity, isAuthResolved } = useAuthSession();
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({
    downloadCount: 0,
    remainingCount: FREE_POSTER_LIMIT_PER_MONTH,
    monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
    periodKey: null,
  });
  const [quotaSource, setQuotaSource] = useState<"local" | "remote">("local");
  const [premiumTrialQuota, setPremiumTrialQuota] = useState<PremiumTrialQuotaStatus>(getDefaultPremiumTrialQuota());

  const subscriptionPlan = useMemo(() => resolvePlanFromAuthUser(authUser), [authUser]);
  const appRole = useMemo(() => resolveRoleFromAuthUser(authUser), [authUser]);
  const premiumTrial = useMemo(
    () => getPremiumTrialStatus(authUser, subscriptionPlan),
    [authUser, subscriptionPlan],
  );
  const plan = useMemo<SubscriptionPlan>(
    () => {
      if (appRole === "superadmin") {
        return "premium";
      }

      if (subscriptionPlan === "premium" && premiumTrial.isExpired) {
        return "free";
      }

      return subscriptionPlan;
    },
    [appRole, premiumTrial.isExpired, subscriptionPlan],
  );

  const refreshQuota = useCallback(async () => {
    if (!isAuthResolved) {
      return;
    }

    if (!authUser) {
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      setPremiumTrialQuota(getDefaultPremiumTrialQuota());
      return;
    }

    if (premiumTrial.isActive) {
      const { data, error } = await supabase
        .from("workspace_state")
        .select("analytics")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (error || !data || !Array.isArray(data.analytics)) {
        setPremiumTrialQuota(getDefaultPremiumTrialQuota());
      } else {
        const trialEndMs = premiumTrial.endsAt ? new Date(premiumTrial.endsAt).getTime() : Number.POSITIVE_INFINITY;
        const downloadCount = data.analytics.filter((event) => {
          if (!event || typeof event !== "object") {
            return false;
          }

          const maybeType = "type" in event ? event.type : null;
          const maybeCreatedAt = "createdAt" in event ? event.createdAt : null;
          const createdAtMs = typeof maybeCreatedAt === "string" ? new Date(maybeCreatedAt).getTime() : Number.NaN;

          return maybeType === "poster_downloaded" && !Number.isNaN(createdAtMs) && createdAtMs <= trialEndMs;
        }).length;

        setPremiumTrialQuota({
          downloadCount,
          remainingCount: Math.max(0, PREMIUM_TRIAL_DOWNLOAD_LIMIT - downloadCount),
          downloadLimit: PREMIUM_TRIAL_DOWNLOAD_LIMIT,
        });
      }
    } else {
      setPremiumTrialQuota(getDefaultPremiumTrialQuota());
    }

    if (plan !== "free") {
      setQuotaStatus({
        downloadCount: 0,
        remainingCount: FREE_POSTER_LIMIT_PER_MONTH,
        monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
        periodKey: getCurrentMonthKey(),
      });
      setQuotaSource("remote");
      return;
    }
    const { data, error } = await supabase.rpc("get_free_poster_quota_status");

    if (error || !data || data.length === 0) {
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      return;
    }

    const nextStatus = data[0];
    setQuotaStatus({
      downloadCount: nextStatus.download_count,
      remainingCount: nextStatus.remaining_count,
      monthlyLimit: nextStatus.monthly_limit,
      periodKey: nextStatus.period_key,
    });
    setQuotaSource("remote");
  }, [authUser, identity, isAuthResolved, plan, premiumTrial.endsAt, premiumTrial.isActive]);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    void refreshQuota();
  }, [identity, isAuthResolved, plan, refreshQuota]);

  const recordPosterDownload = useCallback(async () => {
    if (premiumTrial.isActive) {
      if (premiumTrialQuota.remainingCount <= 0) {
        return false;
      }

      setPremiumTrialQuota((currentQuota) => ({
        ...currentQuota,
        downloadCount: currentQuota.downloadCount + 1,
        remainingCount: Math.max(0, currentQuota.remainingCount - 1),
      }));
      return true;
    }

    if (plan !== "free" || !authUser) {
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
      downloadCount: nextStatus.download_count,
      remainingCount: nextStatus.remaining_count,
      monthlyLimit: nextStatus.monthly_limit,
      periodKey: nextStatus.period_key,
    });
    setQuotaSource("remote");
    return nextStatus.allowed;
  }, [authUser, identity, plan, premiumTrial.isActive, premiumTrialQuota.remainingCount]);

  const remainingFreePosters = Math.max(0, quotaStatus.remainingCount);
  const canGeneratePoster = true;
  const canDownloadPoster = premiumTrial.isActive
    ? premiumTrialQuota.remainingCount > 0
    : plan !== "free" || remainingFreePosters > 0;
  const isPremiumTier = plan === "premium";
  const isDiamondTier = plan === "diamond";
  const isPaidTier = isPremiumTier || isDiamondTier;
  const isSuperadmin = appRole === "superadmin";
  const isPremiumTrialActive = !isSuperadmin && subscriptionPlan === "premium" && premiumTrial.isActive;
  const hasPremiumTrialExpired = !isSuperadmin && subscriptionPlan === "premium" && premiumTrial.isExpired;

  return {
    plan,
    subscriptionPlan,
    appRole,
    isAuthResolved,
    identity,
    userEmail: authUser?.email ?? null,
    isSuperadmin,
    isFreeTier: plan === "free",
    isPremiumTier,
    isDiamondTier,
    isPaidTier,
    isPremiumTrialActive,
    hasPremiumTrialExpired,
    premiumTrialEndsAt: premiumTrial.endsAt,
    premiumTrialDaysRemaining: premiumTrial.daysRemaining,
    premiumTrialDownloadCount: premiumTrialQuota.downloadCount,
    premiumTrialDownloadsRemaining: premiumTrialQuota.remainingCount,
    premiumTrialDownloadLimit: premiumTrialQuota.downloadLimit,
    monthlyPosterCount: quotaStatus.downloadCount,
    remainingFreePosters,
    canGeneratePoster,
    canDownloadPoster,
    isQuotaLoading: false,
    quotaSource,
    refreshQuota,
    recordPosterDownload,
  };
};
