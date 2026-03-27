import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { buildOAuthRedirectUrl, sanitizeRedirectPath } from "@/lib/auth";
import { clearRateLimit, consumeRateLimit, formatRetryWindow } from "@/lib/rate-limit";
import { toast } from "@/components/ui/use-toast";

const AUTH_WINDOW_MS = 10 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 5;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const redirectTo = sanitizeRedirectPath((location.state as { redirectTo?: string } | null)?.redirectTo, "/dashboard");
  const isSubmitting = isLoading || isGoogleLoading;
  const rateLimitKey = `login:${email.trim().toLowerCase() || "anonymous"}`;

  const showRateLimitToast = (retryAfterMs: number) => {
    toast({
      title: t.authRateLimitTitle,
      description: t.authRateLimitDesc.replace("{time}", formatRetryWindow(retryAfterMs)),
      variant: "destructive",
    });
  };

  const handleGoogleLogin = async () => {
    const attempt = consumeRateLimit(`${rateLimitKey}:google`, AUTH_MAX_ATTEMPTS, AUTH_WINDOW_MS);
    if (!attempt.allowed) {
      showRateLimitToast(attempt.retryAfterMs);
      return;
    }

    setIsGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildOAuthRedirectUrl(redirectTo),
      },
    });

    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: t.authGoogleErrorTitle,
        description: error.message || t.authGoogleErrorDesc,
        variant: "destructive",
      });
      return;
    }

    clearRateLimit(`${rateLimitKey}:google`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: t.authToastMissingLoginTitle,
        description: t.authToastMissingLoginDesc,
      });
      return;
    }

    const attempt = consumeRateLimit(rateLimitKey, AUTH_MAX_ATTEMPTS, AUTH_WINDOW_MS);
    if (!attempt.allowed) {
      showRateLimitToast(attempt.retryAfterMs);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      toast({
        title: t.authToastLoginFailedTitle,
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    clearRateLimit(rateLimitKey);
    toast({
      title: t.authToastLoginSuccessTitle,
      description: t.authToastLoginSuccessDesc.replace("{email}", data.user?.email ?? "user"),
    });

    navigate(redirectTo);
  };

  return (
    <AuthShell
      eyebrow={t.authLoginEyebrow}
      title={t.authLoginTitle}
      subtitle={t.authLoginSubtitle}
      switchPrompt={t.authLoginSwitchPrompt}
      switchLabel={t.authLoginSwitchLabel}
      switchTo={{ pathname: "/register", state: { redirectTo } }}
      form={(
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t.authLoginEmailLabel}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authLoginEmailPlaceholder}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t.authLoginPasswordLabel}</Label>
              <span className="text-xs text-muted-foreground">{t.authLoginPasswordHint}</span>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.authLoginPasswordPlaceholder}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            {t.authLoginRedirectHint}
          </div>

          <Button type="submit" className="h-12 w-full text-base" disabled={isSubmitting}>
            {isLoading ? t.authLoginLoading : t.authLoginButton}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="bg-card px-3">{t.authOrDivider}</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="h-12 w-full text-base" disabled={isSubmitting} onClick={handleGoogleLogin}>
            <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
              G
            </span>
            {isGoogleLoading ? t.authGoogleLoading : t.authGoogleButton}
          </Button>
        </form>
      )}
    />
  );
};

export default Login;
