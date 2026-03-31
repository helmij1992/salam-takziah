import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { resolvePlanMetadataValue, sanitizeRedirectPath, sanitizeSelectedPlan } from "@/lib/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isActive = true;

    const redirectTarget = sanitizeRedirectPath(
      new URLSearchParams(location.search).get("redirectTo"),
      "/dashboard",
    );
    const selectedPlan = sanitizeSelectedPlan(
      new URLSearchParams(location.search).get("selectedPlan"),
    );

    const finish = (target: string) => {
      if (!isActive) {
        return;
      }

      navigate(target, { replace: true });
    };

    const resolveSession = async () => {
      try {
        const applySelectedPlan = async () => {
          if (selectedPlan !== "pro") {
            return true;
          }

          const { error } = await supabase.auth.updateUser({
            data: {
              plan: resolvePlanMetadataValue(selectedPlan),
            },
          });

          return !error;
        };

        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const authCode = new URLSearchParams(location.search).get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && await applySelectedPlan()) {
            finish(redirectTarget);
            return;
          }
        }

        if (authCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (!error && await applySelectedPlan()) {
            finish(redirectTarget);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data.session && await applySelectedPlan()) {
          finish(redirectTarget);
          return;
        }
      } catch {
        // Fall through to the auth listener and timeout fallback.
      }
    };

    void resolveSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        finish(redirectTarget);
      }
    });

    const timeoutId = window.setTimeout(() => {
      finish("/login");
    }, 6000);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [location.search, navigate]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      Finalizing sign-in...
    </main>
  );
};

export default AuthCallback;
