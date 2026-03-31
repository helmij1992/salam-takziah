import { useCallback, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "premium" | "diamond";
export type AppRole = "user" | "superadmin";

type AuthUserState = {
  id: string;
  email: string | null;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
} | null;

const FREE_POSTER_LIMIT_PER_MONTH = 5;
const FREE_POSTER_USAGE_KEY = "salam-takziah-free-usage";
const SUPERADMIN_EMAILS = ["ai.helmij@gmail.com", "superadmin.test@salamtakziah.com"];

type UsageStore = Record<string, number>;
type QuotaStatus = {
  downloadCount: number;
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

const getAuthUserState = (session: Session | null): AuthUserState => {
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    userMetadata: (session.user.user_metadata ?? {}) as Record<string, unknown>,
    appMetadata: (session.user.app_metadata ?? {}) as Record<string, unknown>,
  };
};

const isSameAuthUserState = (left: AuthUserState, right: AuthUserState) => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
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

const getIdentityFromAuthUser = (authUser: AuthUserState) => {
  if (authUser?.id) {
    return authUser.id;
  }

  return "guest";
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

export const useSubscription = () => {
  const [authUser, setAuthUser] = useState<AuthUserState>(null);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({
    downloadCount: 0,
    remainingCount: FREE_POSTER_LIMIT_PER_MONTH,
    monthlyLimit: FREE_POSTER_LIMIT_PER_MONTH,
    periodKey: null,
  });
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [quotaSource, setQuotaSource] = useState<"local" | "remote">("local");

  const subscriptionPlan = useMemo(() => resolvePlanFromAuthUser(authUser), [authUser]);
  const appRole = useMemo(() => resolveRoleFromAuthUser(authUser), [authUser]);
  const plan = useMemo<SubscriptionPlan>(
    () => (appRole === "superadmin" ? "diamond" : subscriptionPlan),
    [appRole, subscriptionPlan],
  );
  const identity = useMemo(() => getIdentityFromAuthUser(authUser), [authUser]);

  const refreshQuota = useCallback(async () => {
    if (!isAuthResolved) {
      return;
    }

    if (!authUser) {
      setQuotaStatus(getLocalQuotaStatus(identity));
      setQuotaSource("local");
      setIsQuotaLoading(false);
      return;
    }

    if (plan !== "free") {
      setQuotaStatus({
        downloadCount: 0,
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
      downloadCount: nextStatus.download_count,
      remainingCount: nextStatus.remaining_count,
      monthlyLimit: nextStatus.monthly_limit,
      periodKey: nextStatus.period_key,
    });
    setQuotaSource("remote");
    setIsQuotaLoading(false);
  }, [authUser, identity, isAuthResolved, plan]);

  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const nextAuthUser = getAuthUserState(data.session);
        setAuthUser((currentAuthUser) => (isSameAuthUserState(currentAuthUser, nextAuthUser) ? currentAuthUser : nextAuthUser));
      } catch {
        setAuthUser(null);
      } finally {
        setIsAuthResolved(true);
      }
    };

    void syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextAuthUser = getAuthUserState(nextSession);
      setAuthUser((currentAuthUser) => (isSameAuthUserState(currentAuthUser, nextAuthUser) ? currentAuthUser : nextAuthUser));
      setIsAuthResolved(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    void refreshQuota();
  }, [identity, isAuthResolved, plan, refreshQuota]);

  const recordPosterDownload = useCallback(async () => {
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
  }, [authUser, identity, plan]);

  const remainingFreePosters = Math.max(0, quotaStatus.remainingCount);
  const canGeneratePoster = true;
  const canDownloadPoster = plan !== "free" || remainingFreePosters > 0;
  const isPremiumTier = plan === "premium";
  const isDiamondTier = plan === "diamond";
  const isPaidTier = isPremiumTier || isDiamondTier;
  const isSuperadmin = appRole === "superadmin";

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
    monthlyPosterCount: quotaStatus.downloadCount,
    remainingFreePosters,
    canGeneratePoster,
    canDownloadPoster,
    isQuotaLoading,
    quotaSource,
    refreshQuota,
    recordPosterDownload,
  };
};
