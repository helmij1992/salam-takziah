import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isActive = true;

    const redirectTarget = sanitizeRedirectPath(
      new URLSearchParams(location.search).get("redirectTo"),
      "/dashboard",
    );

    const finish = (target: string) => {
      if (!isActive) {
        return;
      }

      navigate(target, { replace: true });
    };

    const resolveSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
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
    }, 4000);

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
