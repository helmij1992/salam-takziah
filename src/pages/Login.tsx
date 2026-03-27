import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: t.authToastMissingLoginTitle,
        description: t.authToastMissingLoginDesc,
      });
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

          <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
            {isLoading ? t.authLoginLoading : t.authLoginButton}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}
    />
  );
};

export default Login;
