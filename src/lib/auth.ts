const DEFAULT_AUTH_REDIRECT = "/dashboard";
const AUTH_PLAN_VALUES = new Set(["basic", "pro"]);

export const sanitizeRedirectPath = (value: unknown, fallback = DEFAULT_AUTH_REDIRECT) => {
  if (typeof value !== "string" || value.length === 0) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (/[\r\n]/.test(value)) {
    return fallback;
  }

  try {
    const redirectUrl = new URL(value, "http://localhost");

    if (redirectUrl.origin !== "http://localhost") {
      return fallback;
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return fallback;
  }
};

export const sanitizeSelectedPlan = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return AUTH_PLAN_VALUES.has(normalizedValue) ? normalizedValue : null;
};

export const resolvePlanMetadataValue = (selectedPlan: unknown) => {
  return sanitizeSelectedPlan(selectedPlan) === "pro" ? "premium" : "free";
};

export const buildOAuthRedirectUrl = (redirectPath: string, selectedPlan?: unknown) => {
  if (typeof window === "undefined") {
    const callbackParams = new URLSearchParams({
      redirectTo: sanitizeRedirectPath(redirectPath),
    });
    const nextPlan = sanitizeSelectedPlan(selectedPlan);
    if (nextPlan) {
      callbackParams.set("selectedPlan", nextPlan);
    }
    return `/auth/callback?${callbackParams.toString()}`;
  }

  const nextPath = sanitizeRedirectPath(redirectPath);
  const callbackParams = new URLSearchParams({
    redirectTo: nextPath,
  });
  const nextPlan = sanitizeSelectedPlan(selectedPlan);
  if (nextPlan) {
    callbackParams.set("selectedPlan", nextPlan);
  }
  return `${window.location.origin}/auth/callback?${callbackParams.toString()}`;
};
