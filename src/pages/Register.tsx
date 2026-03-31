import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, ShieldPlus } from "lucide-react";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { buildOAuthRedirectUrl, resolvePlanMetadataValue, sanitizeRedirectPath, sanitizeSelectedPlan } from "@/lib/auth";
import { clearRateLimit, consumeRateLimit, formatRetryWindow } from "@/lib/rate-limit";
import { toast } from "@/components/ui/use-toast";

const AUTH_WINDOW_MS = 10 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 5;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const authState = (location.state as { redirectTo?: string; selectedPlan?: string } | null) ?? null;
  const selectedPlan = sanitizeSelectedPlan(authState?.selectedPlan);
  const redirectTo = sanitizeRedirectPath(authState?.redirectTo, "/dashboard");
  const isSubmitting = isLoading || isGoogleLoading;
  const rateLimitKey = `register:${email.trim().toLowerCase() || "anonymous"}`;

  useEffect(() => {
    let isActive = true;

    const handleAuthenticatedSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isActive || !data.session) {
          return;
        }

        navigate(redirectTo, { replace: true });
      } catch {
        // Keep the register screen visible if the browser cannot resolve the current session.
      }
    };

    void handleAuthenticatedSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive || !session) {
        return;
      }

      navigate(redirectTo, { replace: true });
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  const showRateLimitToast = (retryAfterMs: number) => {
    toast({
      title: t.authRateLimitTitle,
      description: t.authRateLimitDesc.replace("{time}", formatRetryWindow(retryAfterMs)),
      variant: "destructive",
    });
  };

  const handleGoogleRegister = async () => {
    const attempt = consumeRateLimit(`${rateLimitKey}:google`, AUTH_MAX_ATTEMPTS, AUTH_WINDOW_MS);
    if (!attempt.allowed) {
      showRateLimitToast(attempt.retryAfterMs);
      return;
    }

    setIsGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildOAuthRedirectUrl(redirectTo, selectedPlan),
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

    if (!email || !password || !confirmPassword) {
      toast({
        title: t.authToastMissingRegisterTitle,
        description: t.authToastMissingRegisterDesc,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t.authToastPasswordMismatchTitle,
        description: t.authToastPasswordMismatchDesc,
      });
      return;
    }

    const attempt = consumeRateLimit(rateLimitKey, AUTH_MAX_ATTEMPTS, AUTH_WINDOW_MS);
    if (!attempt.allowed) {
      showRateLimitToast(attempt.retryAfterMs);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          plan: resolvePlanMetadataValue(selectedPlan),
        },
      },
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: t.authToastRegisterFailedTitle,
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    clearRateLimit(rateLimitKey);
    toast({
      title: t.authToastRegisterSuccessTitle,
      description: t.authToastRegisterSuccessDesc.replace("{email}", email),
    });

    if (data.session) {
      navigate(redirectTo);
    } else {
      navigate("/login", { state: { redirectTo, selectedPlan } });
    }
  };

  return (
    <AuthShell
      eyebrow={t.authRegisterEyebrow}
      title={t.authRegisterTitle}
      subtitle={t.authRegisterSubtitle}
      switchPrompt={t.authRegisterSwitchPrompt}
      switchLabel={t.authRegisterSwitchLabel}
      switchTo="/login"
      switchState={{ redirectTo, selectedPlan }}
      form={(
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t.authRegisterEmailLabel}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authRegisterEmailPlaceholder}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t.authRegisterPasswordLabel}</Label>
              <span className="text-xs text-muted-foreground">{t.authRegisterPasswordHint}</span>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.authRegisterPasswordPlaceholder}
                className="h-12 pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.authRegisterConfirmLabel}</Label>
            <div className="relative">
              <ShieldPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.authRegisterConfirmPlaceholder}
                className="h-12 pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            {t.authRegisterPlanHint}
          </div>

          <Button type="submit" className="h-12 w-full text-base" disabled={isSubmitting}>
            {isLoading ? t.authRegisterLoading : t.authRegisterButton}
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

          <Button type="button" variant="outline" className="h-12 w-full text-base" disabled={isSubmitting} onClick={handleGoogleRegister}>
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

export default Register;
