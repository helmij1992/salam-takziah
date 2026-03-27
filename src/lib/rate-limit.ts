const RATE_LIMIT_STORAGE_KEY = "salam-takziah-rate-limits";

type RateLimitBucket = {
  count: number;
  startedAt: number;
};

type RateLimitStore = Record<string, RateLimitBucket>;

const readStore = (): RateLimitStore => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RateLimitStore) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: RateLimitStore) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(store));
};

export const consumeRateLimit = (key: string, maxAttempts: number, windowMs: number) => {
  const now = Date.now();
  const store = readStore();
  const current = store[key];

  if (!current || now - current.startedAt > windowMs) {
    store[key] = { count: 1, startedAt: now };
    writeStore(store);
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, windowMs - (now - current.startedAt)),
    };
  }

  store[key] = { ...current, count: current.count + 1 };
  writeStore(store);
  return { allowed: true, remaining: Math.max(0, maxAttempts - store[key].count), retryAfterMs: 0 };
};

export const clearRateLimit = (key: string) => {
  const store = readStore();
  delete store[key];
  writeStore(store);
};

export const formatRetryWindow = (retryAfterMs: number) => {
  const totalSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.ceil(totalSeconds / 60);
  return `${minutes}m`;
};
