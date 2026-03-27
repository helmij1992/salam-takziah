import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, ShieldPlus } from "lucide-react";

import AuthShell from "@/components/AuthShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? "/dashboard";

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

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          plan: "free",
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

    toast({
      title: t.authToastRegisterSuccessTitle,
      description: t.authToastRegisterSuccessDesc.replace("{email}", email),
    });

    if (data.session) {
      navigate(redirectTo);
    } else {
      navigate("/login", { state: { redirectTo } });
    }
  };

  return (
    <AuthShell
      eyebrow={t.authRegisterEyebrow}
      title={t.authRegisterTitle}
      subtitle={t.authRegisterSubtitle}
      switchPrompt={t.authRegisterSwitchPrompt}
      switchLabel={t.authRegisterSwitchLabel}
      switchTo={{ pathname: "/login", state: { redirectTo } }}
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

          <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
            {isLoading ? t.authRegisterLoading : t.authRegisterButton}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}
    />
  );
};

export default Register;
