const DEFAULT_AUTH_REDIRECT = "/dashboard";

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

export const buildOAuthRedirectUrl = (redirectPath: string) => {
  if (typeof window === "undefined") {
    return `/auth/callback?redirectTo=${encodeURIComponent(sanitizeRedirectPath(redirectPath))}`;
  }

  const nextPath = sanitizeRedirectPath(redirectPath);
  return `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(nextPath)}`;
};
